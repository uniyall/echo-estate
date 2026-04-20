"""
process.py
──────────────────────────────────────────────────────────────────────────────
EchoEstate — Gaussian Splatting Pipeline
Pipeline: video → frames → COLMAP (SfM) → OpenSplat → splat.ply

Two modes:
  local  — video and output dir provided as CLI args or local paths.
           No R2 interaction. Use this on bare-metal A100 or local Docker.

  cloud  — video downloaded from R2 signed URL (R2_VIDEO_URL env var),
           finished .ply uploaded back to R2. Use this on RunPod.

Mode resolution order: --mode flag → PIPELINE_MODE env var → auto-detect
(auto-detect: "cloud" if R2_VIDEO_URL is set, otherwise "local").

Usage — local:
    python3 process.py --mode local --video /input/room.mp4 --output /output

Usage — cloud (env vars set by RunPod dispatcher):
    python3 process.py --mode cloud
    # or just:
    python3 process.py   # auto-detects cloud when R2_VIDEO_URL is present
──────────────────────────────────────────────────────────────────────────────
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.request

from extract_frames import extract_frames


# ── Helpers ────────────────────────────────────────────────────────────────────

def status(stage: str, message: str, data: dict = None):
    """Emit a structured status line. Node.js/RunPod can parse these."""
    payload = {"stage": stage, "message": message}
    if data:
        payload.update(data)
    print(json.dumps(payload), flush=True)


def run(cmd: list, label: str, cwd: str = None) -> subprocess.CompletedProcess:
    """Run a shell command, stream output live, and capture for error reporting."""
    status(label, f"Running: {' '.join(cmd)}")

    output_lines = []
    process = subprocess.Popen(
        cmd, cwd=cwd,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1
    )
    for line in process.stdout:
        print(line, end="", flush=True)
        output_lines.append(line)

    process.wait()
    if process.returncode != 0:
        tail = "".join(output_lines[-40:])
        status(label, f"FAILED (exit {process.returncode})\n{tail}")
        raise RuntimeError(f"{label} failed with exit code {process.returncode}")

    result = subprocess.CompletedProcess(cmd, process.returncode)
    result.stdout = "".join(output_lines)
    return result


# def download_video(url: str, dest_path: str) -> None:
#     """Download a video from a signed R2 URL to a local path."""
#     try:
#         urllib.request.urlretrieve(url, dest_path)
#         size_mb = os.path.getsize(dest_path) / (1024 * 1024)
#         status("download", f"Video downloaded ({size_mb:.1f} MB)", {"dest": dest_path})
#     except Exception as e:
#         raise RuntimeError(f"Failed to download video from R2: {e}")

# def download_video(url: str, dest_path: str) -> None:
#     """Download a video using curl (handles Cloudflare headers automatically)."""
#     try:
#         result = subprocess.run(
#             ["curl", "-L", "-o", dest_path, url],
#             capture_output=True, text=True
#         )
#         if result.returncode != 0:
#             raise RuntimeError(result.stderr)
#         size_mb = os.path.getsize(dest_path) / (1024 * 1024)
#         status("download", f"Video downloaded ({size_mb:.1f} MB)", {"dest": dest_path})
#     except Exception as e:
#         raise RuntimeError(f"Failed to download video from R2: {e}")

def download_video(url: str, dest_path: str) -> None:
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        with urllib.request.urlopen(req) as response, open(dest_path, "wb") as out_file:
            out_file.write(response.read())
        size_mb = os.path.getsize(dest_path) / (1024 * 1024)
        status("download", f"Video downloaded ({size_mb:.1f} MB)", {"dest": dest_path})
    except Exception as e:
        raise RuntimeError(f"Failed to download video from R2: {e}")


def upload_to_r2(ply_path: str, property_id: str) -> str:
    """
    Upload the completed .ply file to Cloudflare R2.
    Imported lazily so local mode never requires boto3.

    Required env vars:
        R2_BUCKET             — e.g. "echoestate-assets"
        R2_ENDPOINT_URL       — e.g. "https://<account_id>.r2.cloudflarestorage.com"
        AWS_ACCESS_KEY_ID     — R2 API token key ID
        AWS_SECRET_ACCESS_KEY — R2 API token secret
    """
    import boto3
    from botocore.client import Config

    bucket     = os.environ["R2_BUCKET"]
    endpoint   = os.environ["R2_ENDPOINT_URL"]
    object_key = f"splats/{property_id}/splat.ply"

    status("upload", "Uploading .ply to R2", {"bucket": bucket, "key": object_key})
    t0 = time.time()

    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

    file_size_mb = os.path.getsize(ply_path) / (1024 * 1024)
    s3.upload_file(ply_path, bucket, object_key)

    r2_url = f"{endpoint}/{bucket}/{object_key}"

    status("upload", "Upload complete", {
        "r2_url": r2_url,
        "size_mb": round(file_size_mb, 1),
        "upload_time_s": round(time.time() - t0, 1),
    })
    return r2_url


# ── Stage 1: Extract frames from video ────────────────────────────────────────

def stage_extract(video_path: str, work_dir: str, fps: float, max_dim: int = 960, max_frames: int = 150) -> str:
    status("extract", "Extracting frames from video", {
        "video": video_path, "fps": fps, "max_dim": max_dim, "max_frames": max_frames
    })
    frames_dir = os.path.join(work_dir, "frames")
    meta = extract_frames(video_path, frames_dir, target_fps=fps, max_dim=max_dim, max_frames=max_frames)
    status("extract", "Frames extracted", meta)
    return frames_dir


# ── Stage 2: COLMAP — Structure from Motion ───────────────────────────────────

def stage_colmap(frames_dir: str, work_dir: str) -> tuple:
    """
    Runs the full COLMAP pipeline:
      1. feature_extractor  — detects keypoints in each image
      2. exhaustive/sequential matcher — finds matching keypoints across image pairs
      3. mapper             — triangulates 3D points, estimates camera poses

    Output: work_dir/colmap/sparse/0/ containing cameras.bin, images.bin, points3D.bin
    """
    colmap_dir = os.path.join(work_dir, "colmap")
    db_path    = os.path.join(colmap_dir, "database.db")
    sparse_dir = os.path.join(colmap_dir, "sparse")

    os.makedirs(colmap_dir, exist_ok=True)
    os.makedirs(sparse_dir, exist_ok=True)

    status("colmap", "Starting COLMAP feature extraction")
    t0 = time.time()

    run([
        "colmap", "feature_extractor",
        "--database_path", db_path,
        "--image_path", frames_dir,
        "--ImageReader.single_camera", "1",
        "--ImageReader.camera_model", "PINHOLE",
        "--FeatureExtraction.use_gpu", "1",
        "--SiftExtraction.max_num_features", "8192",
    ], "colmap:feature_extractor")

    status("colmap", f"Feature extraction done ({time.time()-t0:.0f}s)")

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

    num_threads = str(min(os.cpu_count() or 8, 16))
    run([
        "colmap", "mapper",
        "--database_path", db_path,
        "--image_path", frames_dir,
        "--output_path", sparse_dir,
        "--Mapper.num_threads", num_threads,
        "--Mapper.init_min_tri_angle", "4",
    ], "colmap:mapper")

    recon_dir = os.path.join(sparse_dir, "0")
    if not os.path.exists(recon_dir):
        raise RuntimeError(
            "COLMAP mapper produced no reconstruction. "
            "Check that the video has enough overlap between frames. "
            "Try shooting more slowly or increasing extract FPS."
        )

    # Quality check: count registered images
    analyzer_result = subprocess.run(
        ["colmap", "model_analyzer", "--path", recon_dir],
        capture_output=True, text=True
    )
    analyzer_output = analyzer_result.stdout + analyzer_result.stderr

    match = re.search(r"Images:\s+(\d+)", analyzer_output)
    registered = int(match.group(1)) if match else 0

    total_frames = len([f for f in os.listdir(frames_dir) if f.endswith(".jpg")])
    registration_rate = registered / max(total_frames, 1)

    status("colmap", f"Registered {registered}/{total_frames} images ({registration_rate:.0%})")

    if registered < 10:
        raise RuntimeError(
            f"COLMAP registered only {registered} images — reconstruction too sparse to continue. "
            f"Ensure the video has slow movement, good lighting, and sufficient frame overlap."
        )
    if registration_rate < 0.4:
        status("colmap", f"WARNING: Low registration rate ({registration_rate:.0%}). "
                         f"Splat quality may be poor. Consider re-shooting with slower movement.")

    cameras_bin = os.path.join(recon_dir, "cameras.bin")
    images_bin  = os.path.join(recon_dir, "images.bin")
    status("colmap", "COLMAP complete", {
        "sparse_dir": recon_dir,
        "registered_images": registered,
        "cameras_bin_size_kb": os.path.getsize(cameras_bin) // 1024,
        "images_bin_size_kb": os.path.getsize(images_bin) // 1024,
        "total_time_s": round(time.time() - t0, 1),
    })

    return recon_dir, frames_dir


# ── Stage 3: OpenSplat — Gaussian training ────────────────────────────────────

def stage_opensplat(recon_dir: str, frames_dir: str, output_dir: str, steps: int = 3000) -> str:
    """Trains a Gaussian Splat directly from the COLMAP workspace."""
    os.makedirs(output_dir, exist_ok=True)
    output_ply = os.path.join(output_dir, "splat.ply")

    status("opensplat", f"Starting Gaussian Splatting training ({steps} steps)")
    t0 = time.time()

    # recon_dir is "<work>/colmap/sparse/0" — parent of "sparse" is the COLMAP workspace root
    colmap_project = os.path.dirname(os.path.dirname(recon_dir))

    images_dir = os.path.join(colmap_project, "images")
    # Retry-safe: remove stale symlink from a previous run before re-creating
    if os.path.islink(images_dir):
        os.unlink(images_dir)
    if not os.path.exists(images_dir):
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

    if size_mb < 5:
        status("opensplat", f"WARNING: .ply is very small ({size_mb:.1f} MB) — reconstruction may be poor")
    elif size_mb > 500:
        status("opensplat", f"NOTE: .ply is large ({size_mb:.1f} MB) — consider reducing steps for web delivery")

    status("opensplat", "Training complete", {
        "output_ply": output_ply,
        "size_mb": round(size_mb, 1),
        "training_time_s": round(time.time() - t0, 1),
    })

    return output_ply


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="EchoEstate — video to Gaussian Splat pipeline")
    parser.add_argument("--mode",
                        choices=["local", "cloud"],
                        default=None,
                        help="local: use --video + --output on disk; "
                             "cloud: download from R2_VIDEO_URL, upload result to R2")
    parser.add_argument("--video",      default=None, help="[local] Path to input video file")
    parser.add_argument("--output",     default=None, help="Directory to write splat.ply into")
    parser.add_argument("--fps",        type=float, default=None)
    parser.add_argument("--steps",      type=int,   default=None)
    parser.add_argument("--max-dim",    type=int,   default=None)
    parser.add_argument("--max-frames", type=int,   default=None)
    parser.add_argument("--keep-work",  action="store_true",
                        help="Keep intermediate work files for debugging")
    args = parser.parse_args()

    # ── Resolve mode ───────────────────────────────────────────────────────────
    # Priority: --mode flag > PIPELINE_MODE env var > auto-detect
    mode = (
        args.mode
        or os.getenv("PIPELINE_MODE")
        or ("cloud" if os.getenv("R2_VIDEO_URL") else "local")
    )

    if mode not in ("local", "cloud"):
        status("error", f"Unknown mode '{mode}'. Use 'local' or 'cloud'.")
        sys.exit(1)

    # ── Resolve config: CLI args → env vars → defaults ─────────────────────────
    property_id = os.getenv("PROPERTY_ID", "local")
    output_dir  = args.output     or os.getenv("OUTPUT_DIR",   "/output")
    fps         = args.fps        or float(os.getenv("FPS",    "2.0"))
    steps       = args.steps      or int(os.getenv("STEPS",    "3000"))
    max_dim     = args.max_dim    or int(os.getenv("MAX_DIM",  "960"))
    max_frames  = args.max_frames or int(os.getenv("MAX_FRAMES", "150"))

    # ── Resolve video path ─────────────────────────────────────────────────────
    if mode == "local":
        if not args.video:
            status("error", "local mode requires --video <path>")
            sys.exit(1)
        video_path = args.video

    else:  # cloud
        r2_video_url = os.getenv("R2_VIDEO_URL")
        if not r2_video_url and not args.video:
            status("error", "cloud mode requires R2_VIDEO_URL env var (or --video to override)")
            sys.exit(1)

        if args.video:
            video_path = args.video   # allow local override even in cloud mode
        else:
            os.makedirs(output_dir, exist_ok=True)
            video_path = os.path.join(output_dir, "input_video.mp4")
            status("download", "Downloading video from R2", {"url": r2_video_url[:60] + "..."})
            download_video(r2_video_url, video_path)

    if not os.path.exists(video_path):
        status("error", f"Video not found: {video_path}")
        sys.exit(1)

    # ── Run pipeline ───────────────────────────────────────────────────────────
    work_dir = os.path.join(output_dir, "work")
    os.makedirs(work_dir, exist_ok=True)

    status("pipeline", f"EchoEstate pipeline starting [{mode} mode]", {
        "mode": mode,
        "video": video_path,
        "output": output_dir,
        "fps": fps,
        "steps": steps,
        "max_dim": max_dim,
        "max_frames": max_frames,
        "property_id": property_id,
    })

    t_total = time.time()

    try:
        frames_dir            = stage_extract(video_path, work_dir, fps, max_dim, max_frames)
        recon_dir, frames_dir = stage_colmap(frames_dir, work_dir)
        ply_path              = stage_opensplat(recon_dir, frames_dir, output_dir, steps)

        r2_url = None
        if mode == "cloud":
            r2_url = upload_to_r2(ply_path, property_id)
        else:
            status("upload", "Skipping R2 upload (local mode)")

        if not args.keep_work:
            shutil.rmtree(work_dir, ignore_errors=True)
            status("pipeline", "Work directory cleaned up")

        total_time = round(time.time() - t_total, 1)
        result = {
            "success": True,
            "mode": mode,
            "property_id": property_id,
            "splat_ply": ply_path,
            "total_time_s": total_time,
            "total_time_min": round(total_time / 60, 1),
        }
        if r2_url:
            result["r2_url"] = r2_url   # RunPod reads this from the job output field

        status("pipeline", "SUCCESS", result)
        print(json.dumps(result), flush=True)

    except Exception as e:
        result = {"success": False, "mode": mode, "property_id": property_id, "error": str(e)}
        status("pipeline", f"FAILED: {e}")
        print(json.dumps(result), flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
