import subprocess
import os
import sys
import json
import tempfile


def extract_frames(
    video_path: str,
    output_dir: str,
    target_fps: float = 2.0,
    max_dim: int = 960,
    max_frames: int = 150,
) -> dict:
    """
    Extract frames from video using ffmpeg.
    max_dim: Caps the longest edge of the image to save VRAM.
    max_frames: Hard cap on total frames sent to COLMAP (exhaustive_matcher is O(n²)).
    """
    os.makedirs(output_dir, exist_ok=True)

    # Probe video metadata
    probe_cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_streams", "-show_format",
        video_path
    ]

    result = subprocess.run(probe_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {result.stderr}")

    info = json.loads(result.stdout)
    video_stream = next(s for s in info["streams"] if s["codec_type"] == "video")

    # Safe duration extraction — some containers report "N/A" in format.duration
    raw_duration = info["format"].get("duration") or video_stream.get("duration", "0")
    try:
        duration = float(raw_duration)
    except (ValueError, TypeError):
        raise RuntimeError(
            f"Could not determine video duration from ffprobe output. "
            f"Got: '{raw_duration}'. Try re-encoding the video with: "
            f"ffmpeg -i input.mp4 -c copy output_fixed.mp4"
        )
    if duration <= 0:
        raise RuntimeError("Video duration is zero or negative — file may be corrupt.")

    native_fps_str = video_stream.get("r_frame_rate", "30/1")
    num, den = native_fps_str.split("/")
    native_fps = float(num) / float(den)

    print(f"  Video duration : {duration:.1f}s")
    print(f"  Native FPS     : {native_fps:.2f}")
    print(f"  Target FPS     : {target_fps}")
    print(f"  Max Dimension  : {max_dim}px")
    print(f"  Max Frames     : {max_frames}")

    # Don't extract faster than native FPS
    extract_fps = min(target_fps, native_fps)

    # Hard cap: never send more than max_frames to COLMAP
    # exhaustive_matcher is O(n²) — 150 frames is the practical ceiling for the MIG slice
    if duration * extract_fps > max_frames:
        extract_fps = max_frames / duration
        print(f"  Frame cap applied: capping to {max_frames} frames at {extract_fps:.3f} fps")

    estimated_frames = int(duration * extract_fps)
    print(f"  Estimated frames to extract: {estimated_frames}")

    if estimated_frames < 30:
        print(f"  WARNING: Only {estimated_frames} frames. Consider a longer video or higher FPS.")

    vf_string = f"fps={extract_fps},scale={max_dim}:{max_dim}:force_original_aspect_ratio=decrease"
    output_pattern = os.path.join(output_dir, "frame_%05d.jpg")

    extract_cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", vf_string,
        "-q:v", "2",
        "-start_number", "0",
        "-frames:v", str(max_frames),   # belt-and-suspenders hard cap at ffmpeg level
        output_pattern,
        "-y"
    ]

    print(f"\n  Extracting frames...")

    # Stream stderr to a temp file so it's always available on failure
    with tempfile.NamedTemporaryFile(mode='w', suffix='.log', delete=False) as stderr_log:
        stderr_log_path = stderr_log.name

    with open(stderr_log_path, 'w') as stderr_file:
        result = subprocess.run(extract_cmd, stdout=subprocess.DEVNULL, stderr=stderr_file)

    if result.returncode != 0:
        with open(stderr_log_path) as f:
            stderr_tail = ''.join(f.readlines()[-30:])
        raise RuntimeError(f"ffmpeg failed (exit {result.returncode}):\n{stderr_tail}")

    frames = [f for f in os.listdir(output_dir) if f.endswith(".jpg")]
    frame_count = len(frames)

    print(f"  Extracted {frame_count} frames to {output_dir}")

    return {
        "frame_count": frame_count,
        "duration": duration,
        "native_fps": native_fps,
        "extract_fps": extract_fps,
        "max_dim_cap": max_dim,
        "max_frames_cap": max_frames,
        "frames_capped": frame_count >= max_frames,
        "output_dir": output_dir
    }


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 extract_frames.py <video_path> <output_dir> [fps] [max_dim] [max_frames]")
        sys.exit(1)

    video = sys.argv[1]
    out = sys.argv[2]
    fps = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
    dim = int(sys.argv[4]) if len(sys.argv) > 4 else 960
    max_frames = int(sys.argv[5]) if len(sys.argv) > 5 else 150

    meta = extract_frames(video, out, fps, dim, max_frames)
    print(json.dumps(meta, indent=2))
