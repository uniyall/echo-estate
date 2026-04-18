"""
process.py
──────────────────────────────────────────────────────────────────────────────
EchoEstate — Gaussian Splatting Pipeline
Pipeline: video → frames → COLMAP (SfM) → OpenSplat → splat.ply

Usage (local test):
    python3 process.py --video /input/room.mp4 --output /output

Usage (Docker):
    docker run --gpus all -v /path/to/video:/input -v /path/to/out:/output \
        echostate-worker --video /input/room.mp4 --output /output

The script writes status updates to stdout as JSON lines so the caller
(Node.js or RunPod) can parse progress without scraping log text.
──────────────────────────────────────────────────────────────────────────────
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

from extract_frames import extract_frames


# ── Helpers ────────────────────────────────────────────────────────────────────

def status(stage: str, message: str, data: dict = None):
    """Emit a structured status line. Node.js/RunPod can parse these."""
    payload = {"stage": stage, "message": message}
    if data:
        payload.update(data)
    print(json.dumps(payload), flush=True)


def run(cmd: list, label: str, cwd: str = None) -> subprocess.CompletedProcess:
    """Run a shell command, stream output, raise on failure."""
    status(label, f"Running: {' '.join(cmd)}")
    result = subprocess.run(
        cmd,
        cwd=cwd,
        text=True,
        stdout=sys.stdout,
        stderr=subprocess.STDOUT   # merge stderr into stdout
    )
    if result.returncode != 0:
        # Print last 40 lines of output to help debug
        lines = result.stdout.splitlines()
        tail = "\n".join(lines[-40:])
        status(label, f"FAILED (exit {result.returncode})\n{tail}")
        raise RuntimeError(f"{label} failed with exit code {result.returncode}")
    return result


# ── Stage 1: Extract frames from video ────────────────────────────────────────

def stage_extract(video_path: str, work_dir: str, fps: float) -> str:
    status("extract", "Extracting frames from video", {"video": video_path, "fps": fps})
    frames_dir = os.path.join(work_dir, "frames")
    meta = extract_frames(video_path, frames_dir, target_fps=fps)
    status("extract", "Frames extracted", meta)
    return frames_dir


# ── Stage 2: COLMAP — Structure from Motion ───────────────────────────────────

def stage_colmap(frames_dir: str, work_dir: str) -> str:
    """
    Runs the full COLMAP pipeline:
      1. feature_extractor  — detects keypoints in each image
      2. exhaustive_matcher — finds matching keypoints across image pairs
      3. mapper             — triangulates 3D points, estimates camera poses
      4. image_undistorter  — prepares output for downstream tools

    Output: work_dir/colmap/sparse/0/ containing:
      cameras.bin, images.bin, points3D.bin
    """
    colmap_dir = os.path.join(work_dir, "colmap")
    db_path    = os.path.join(colmap_dir, "database.db")
    sparse_dir = os.path.join(colmap_dir, "sparse")
    dense_dir  = os.path.join(colmap_dir, "dense")

    os.makedirs(colmap_dir, exist_ok=True)
    os.makedirs(sparse_dir, exist_ok=True)

    status("colmap", "Starting COLMAP feature extraction")
    t0 = time.time()

    # Step 1: Feature extraction
    # SIFT features on each frame. GPU accelerated on A100.
    run([
        "colmap", "feature_extractor",
        "--database_path", db_path,
        "--image_path", frames_dir,
        "--ImageReader.single_camera", "1",   # assume one camera for video
        "--ImageReader.camera_model", "PINHOLE",
        "--FeatureExtraction.use_gpu", "1",
        "--SiftExtraction.max_num_features", "8192",
    ], "colmap:feature_extractor")

    status("colmap", f"Feature extraction done ({time.time()-t0:.0f}s)")

    # Step 2: Feature matching
    # exhaustive_matcher checks all pairs — best quality, slower.
    # For longer videos (>300 frames) use sequential_matcher instead.
    frame_count = len([f for f in os.listdir(frames_dir) if f.endswith(".jpg")])

    if frame_count > 300:
        status("colmap", f"{frame_count} frames — using sequential_matcher for speed")
        matcher = "sequential_matcher"
        matcher_args = [
            "--SequentialMatching.overlap", "30",
            "--SequentialMatching.loop_detection", "1",
        ]
    else:
        status("colmap", f"{frame_count} frames — using exhaustive_matcher for quality")
        matcher = "exhaustive_matcher"
        matcher_args = []

    run([
        "colmap", matcher,
        "--database_path", db_path,
        "--FeatureMatching.use_gpu", "1",
    ] + matcher_args, "colmap:matcher")

    status("colmap", f"Feature matching done ({time.time()-t0:.0f}s)")

    # Step 3: Incremental mapper — reconstructs the scene geometry
    run([
        "colmap", "mapper",
        "--database_path", db_path,
        "--image_path", frames_dir,
        "--output_path", sparse_dir,
        "--Mapper.num_threads", "16",
        "--Mapper.init_min_tri_angle", "4",
    ], "colmap:mapper")

    # Verify reconstruction succeeded
    recon_dir = os.path.join(sparse_dir, "0")
    if not os.path.exists(recon_dir):
        raise RuntimeError(
            "COLMAP mapper produced no reconstruction. "
            "Check that the video has enough overlap between frames. "
            "Try shooting more slowly or increasing extract FPS."
        )

    # Count reconstructed cameras (should be close to frame count)
    cameras_bin = os.path.join(recon_dir, "cameras.bin")
    images_bin  = os.path.join(recon_dir, "images.bin")
    status("colmap", f"Mapper done ({time.time()-t0:.0f}s)", {
        "sparse_dir": recon_dir,
        "cameras_bin_size_kb": os.path.getsize(cameras_bin) // 1024,
        "images_bin_size_kb": os.path.getsize(images_bin) // 1024,
    })

    # Step 4: Convert binary output to text format (OpenSplat reads text)
    # text_dir = os.path.join(colmap_dir, "sparse_txt")
    # os.makedirs(text_dir, exist_ok=True)
    # run([
    #     "colmap", "model_converter",
    #     "--input_path", recon_dir,
    #     "--output_path", text_dir,
    #     "--output_type", "TXT",
    # ], "colmap:model_converter")

    # status("colmap", "COLMAP complete", {
    #     "sparse_txt_dir": text_dir,
    #     "total_time_s": round(time.time() - t0, 1)
    # })
    status("colmap", "COLMAP complete", {
        "sparse_dir": recon_dir,
        "total_time_s": round(time.time() - t0, 1)
    })

    return recon_dir, frames_dir


# ── Stage 3: OpenSplat — Gaussian training ────────────────────────────────────

def stage_opensplat(
    recon_dir: str,
    frames_dir: str,
    output_dir: str,
    steps: int = 3000
) -> str:
    """
    Trains a Gaussian Splat directly from the COLMAP workspace.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_ply = os.path.join(output_dir, "splat.ply")

    status("opensplat", f"Starting Gaussian Splatting training ({steps} steps)")
    t0 = time.time()

    # recon_dir is "./test_output/work/colmap/sparse/0"
    # The parent of "sparse" is the actual COLMAP workspace root.
    colmap_project = os.path.dirname(os.path.dirname(recon_dir))

    # OpenSplat just needs the images placed in an "images" folder inside that workspace
    images_dir = os.path.join(colmap_project, "images")
    if not os.path.exists(images_dir):
        # CRITICAL: Use absolute path to prevent broken symlinks!
        os.symlink(os.path.abspath(frames_dir), images_dir)

    run([
        "opensplat",
        colmap_project,
        "-n", str(steps),
        "-o", output_ply,
    ], "opensplat")

    if not os.path.exists(output_ply):
        raise RuntimeError(f"OpenSplat finished but no output at {output_ply}")

    size_mb = os.path.getsize(output_ply) / (1024 * 1024)
    status("opensplat", "Training complete", {
        "output_ply": output_ply,
        "size_mb": round(size_mb, 1),
        "training_time_s": round(time.time() - t0, 1)
    })

    return output_ply

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="EchoEstate — video to Gaussian Splat pipeline")
    parser.add_argument("--video",   required=True,  help="Path to input video file (MP4, MOV, etc.)")
    parser.add_argument("--output",  required=True,  help="Directory to write splat.ply into")
    parser.add_argument("--fps",     type=float, default=2.0,
                        help="Frames per second to extract (default 2.0, range 1.0–4.0)")
    parser.add_argument("--steps",   type=int,   default=3000,
                        help="OpenSplat training steps (3000=fast test, 30000=full quality)")
    parser.add_argument("--keep-work", action="store_true",
                        help="Keep intermediate work files (frames, COLMAP output) for debugging")
    args = parser.parse_args()

    # Validate input
    if not os.path.exists(args.video):
        status("error", f"Video not found: {args.video}")
        sys.exit(1)

    work_dir = os.path.join(args.output, "work")
    os.makedirs(work_dir, exist_ok=True)

    status("pipeline", "EchoEstate Gaussian Splatting pipeline starting", {
        "video": args.video,
        "output": args.output,
        "fps": args.fps,
        "steps": args.steps
    })

    t_total = time.time()

    try:
        # Stage 1 — Extract frames
        frames_dir = stage_extract(args.video, work_dir, args.fps)

        # Stage 2 — COLMAP
        recon_dir, frames_dir = stage_colmap(frames_dir, work_dir)

        # Stage 3 — OpenSplat
        ply_path = stage_opensplat(recon_dir, frames_dir, args.output, args.steps)

        # Cleanup work dir unless --keep-work
        if not args.keep_work:
            shutil.rmtree(work_dir, ignore_errors=True)
            status("pipeline", "Work directory cleaned up")

        total_time = round(time.time() - t_total, 1)
        status("pipeline", "SUCCESS", {
            "splat_ply": ply_path,
            "total_time_s": total_time,
            "total_time_min": round(total_time / 60, 1)
        })

        # Final clean JSON result for programmatic callers
        print(json.dumps({
            "success": True,
            "splat_ply": ply_path,
            "total_time_s": total_time
        }), flush=True)

    except Exception as e:
        status("pipeline", f"FAILED: {e}")
        print(json.dumps({"success": False, "error": str(e)}), flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
