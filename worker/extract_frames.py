import subprocess
import os
import sys
import json

def extract_frames(video_path: str, output_dir: str, target_fps: float = 2.0, max_dim: int = 1280) -> dict:
    """
    Extract frames from video using ffmpeg.
    max_dim: Caps the longest edge of the image (e.g., 1280 or 1920) to save VRAM.
    """
    os.makedirs(output_dir, exist_ok=True)

    # First probe the video to get duration and native FPS
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

    duration = float(info["format"]["duration"])
    video_stream = next(s for s in info["streams"] if s["codec_type"] == "video")
    native_fps_str = video_stream.get("r_frame_rate", "30/1")

    # Parse "30/1" or "60000/1001" style FPS strings
    num, den = native_fps_str.split("/")
    native_fps = float(num) / float(den)

    print(f"  Video duration : {duration:.1f}s")
    print(f"  Native FPS     : {native_fps:.2f}")
    print(f"  Target FPS     : {target_fps}")
    print(f"  Max Dimension  : {max_dim}px")

    # Don't extract faster than native FPS
    extract_fps = min(target_fps, native_fps)
    estimated_frames = int(duration * extract_fps)
    print(f"  Estimated frames to extract: {estimated_frames}")

    if estimated_frames < 30:
        print(f"  WARNING: Only {estimated_frames} frames. Consider a longer video or higher FPS.")
    if estimated_frames > 500:
        print(f"  NOTE: {estimated_frames} frames — COLMAP will be slower.")

    # Format the video filter string
    # force_original_aspect_ratio=decrease ensures it scales down to fit within max_dim x max_dim
    # without altering the aspect ratio, and only if it's larger than max_dim.
    vf_string = f"fps={extract_fps},scale={max_dim}:{max_dim}:force_original_aspect_ratio=decrease"

    output_pattern = os.path.join(output_dir, "frame_%05d.jpg")
    extract_cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", vf_string,
        "-q:v", "2",          # high quality JPEG
        "-start_number", "0",
        output_pattern,
        "-y"                  # overwrite existing
    ]

    print(f"\n  Extracting frames...")
    result = subprocess.run(extract_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr}")

    frames = [f for f in os.listdir(output_dir) if f.endswith(".jpg")]
    frame_count = len(frames)

    print(f"  Extracted {frame_count} frames to {output_dir}")

    return {
        "frame_count": frame_count,
        "duration": duration,
        "native_fps": native_fps,
        "extract_fps": extract_fps,
        "max_dim_cap": max_dim,
        "output_dir": output_dir
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 extract_frames.py <video_path> <output_dir> [fps] [max_dim]")
        sys.exit(1)

    video = sys.argv[1]
    out = sys.argv[2]
    fps = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
    dim = int(sys.argv[4]) if len(sys.argv) > 4 else 1280

    meta = extract_frames(video, out, fps, dim)
    print(json.dumps(meta, indent=2))