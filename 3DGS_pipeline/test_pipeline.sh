#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# test_pipeline.sh
# EchoEstate — Local viability test for the Gaussian Splatting pipeline
#
# Run this DIRECTLY on your A100 VM (before Docker) to validate:
#   1. CUDA is accessible
#   2. COLMAP is installed and GPU-accelerated
#   3. OpenSplat is installed
#   4. The full pipeline produces a .ply from a test video
#
# Usage:
#   chmod +x test_pipeline.sh
#   ./test_pipeline.sh /path/to/your/room.mp4
#
# What "success" looks like:
#   - A splat.ply file in ./test_output/
#   - File size between 20MB–200MB
#   - Total time under 20 min on an A100
# ──────────────────────────────────────────────────────────────────────────────

set -e   # exit immediately on any error

VIDEO_PATH="${1:-}"
OUTPUT_DIR="./test_output"
WORK_DIR="$OUTPUT_DIR/work"
STEPS="${STEPS:-3000}"   # override with: STEPS=10000 ./test_pipeline.sh ...

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EchoEstate — Gaussian Splatting Pipeline Viability Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Check 1: CUDA ──────────────────────────────────────────────────────────────
echo "[ 1/5 ] Checking CUDA..."
if ! command -v nvidia-smi &>/dev/null; then
    echo "  FAIL: nvidia-smi not found. Is this an NVIDIA machine?"
    exit 1
fi

nvidia-smi --query-gpu=name,memory.total,driver_version \
           --format=csv,noheader,nounits | \
while IFS=',' read -r name mem driver; do
    echo "  GPU    : $name"
    echo "  VRAM   : ${mem} MB"
    echo "  Driver : $driver"
done
echo "  PASS: CUDA accessible"
echo ""

# ── Check 2: COLMAP ────────────────────────────────────────────────────────────
echo "[ 2/5 ] Checking COLMAP..."
if ! command -v colmap &>/dev/null; then
    echo ""
    echo "  COLMAP not found. Installing from apt (Ubuntu 22.04)..."
    echo "  (On other distros, see: https://colmap.github.io/install.html)"
    echo ""
    sudo apt-get update -qq
    sudo apt-get install -y colmap
fi

COLMAP_MAJOR=$(colmap --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
echo "  Version: $COLMAP_MAJOR"

# Warn if below PRD requirement (3.9+); Docker compiles from source so this is bare-metal only
if python3 -c "import sys; sys.exit(0 if float('$COLMAP_MAJOR') >= 3.9 else 1)" 2>/dev/null; then
    echo "  PASS: COLMAP >= 3.9"
else
    echo "  WARNING: COLMAP $COLMAP_MAJOR < 3.9 (PRD requires 3.9+)"
    echo "           For production, COLMAP is compiled from source in Docker."
    echo "           This bare-metal version may produce slightly different results."
fi
echo ""

# ── Check 3: OpenSplat ─────────────────────────────────────────────────────────
echo "[ 3/5 ] Checking OpenSplat..."
if ! command -v opensplat &>/dev/null; then
    echo ""
    echo "  OpenSplat not found. Building from source..."
    echo "  This will take 5-10 minutes on first run."
    echo ""

    for dep in cmake ninja-build git; do
        if ! command -v "$dep" &>/dev/null; then
            echo "  Installing $dep..."
            sudo apt-get install -y "$dep" -qq
        fi
    done

    if ! python3 -c "import torch; print(torch.__version__)" &>/dev/null; then
        echo "  Installing PyTorch (CUDA 12.1)..."
        pip3 install torch==2.1.0+cu121 torchvision==0.16.0+cu121 \
            --index-url https://download.pytorch.org/whl/cu121 -q
    fi

    TORCH_CMAKE=$(python3 -c "import torch; print(torch.utils.cmake_prefix_path)")

    echo "  Cloning OpenSplat..."
    git clone https://github.com/pierotofy/OpenSplat.git /tmp/OpenSplat -q
    cd /tmp/OpenSplat
    mkdir -p build && cd build
    cmake .. -GNinja \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_PREFIX_PATH="$TORCH_CMAKE" \
        -DCUDA_ARCHITECTURES="80;89" \
        2>&1 | tail -5
    ninja -j$(nproc) 2>&1 | tail -5
    sudo cp opensplat /usr/local/bin/opensplat
    cd ~
    echo "  OpenSplat built and installed."
fi

echo "  PASS: OpenSplat installed at $(which opensplat)"
echo ""

# ── Check 4: ffmpeg ────────────────────────────────────────────────────────────
echo "[ 4/5 ] Checking ffmpeg..."
if ! command -v ffmpeg &>/dev/null; then
    echo "  Installing ffmpeg..."
    sudo apt-get install -y ffmpeg -qq
fi
FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -1 | cut -d' ' -f3)
echo "  Version: $FFMPEG_VERSION"
echo "  PASS: ffmpeg installed"
echo ""

# ── Check 5: Video input ───────────────────────────────────────────────────────
echo "[ 5/5 ] Preparing video input..."

if [ -z "$VIDEO_PATH" ]; then
    echo "  No video provided."
    echo ""
    echo "  Please supply your own test video:"
    echo "    ./test_pipeline.sh /path/to/your/room.mp4"
    echo ""
    echo "  Requirements for a good test video:"
    echo "    - 30–90 seconds of slow walking through a room"
    echo "    - Good lighting, no motion blur, no fast pans"
    echo "    - Shot on any smartphone in landscape orientation"
    echo "    - Camera should move continuously — do not pan from a fixed point"
    echo ""
    echo "  Cannot proceed without a video. Exiting."
    exit 1
fi

if [ ! -f "$VIDEO_PATH" ]; then
    echo "  FAIL: Video not found at $VIDEO_PATH"
    exit 1
fi

VIDEO_SIZE=$(du -sh "$VIDEO_PATH" | cut -f1)
echo "  Video: $VIDEO_PATH ($VIDEO_SIZE)"
echo "  PASS: Video ready"
echo ""

# ── Run the pipeline ───────────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Running pipeline ($STEPS training steps — fast viability test)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

mkdir -p "$OUTPUT_DIR"
START_TIME=$(date +%s)

python3 worker/process.py \
    --mode local \
    --video "$VIDEO_PATH" \
    --output "$OUTPUT_DIR" \
    --fps 2.0 \
    --steps "$STEPS" \
    --keep-work   # keep intermediate files on first run for debugging

EXIT_CODE=$?
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
ELAPSED_MIN=$((ELAPSED / 60))
ELAPSED_SEC=$((ELAPSED % 60))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -ne 0 ]; then
    echo "  PIPELINE FAILED (exit code $EXIT_CODE)"
    echo "  Check the output above for the error."
    echo ""
    echo "  Common issues:"
    echo "    - COLMAP reconstruction failed → video too short / too blurry / too fast"
    echo "    - OOM error → reduce --fps or use sequential_matcher"
    echo "    - opensplat not found → check build step above"
    exit 1
fi

PLY_PATH="$OUTPUT_DIR/splat.ply"

if [ ! -f "$PLY_PATH" ]; then
    echo "  PIPELINE COMPLETED BUT NO .PLY FOUND"
    echo "  Expected: $PLY_PATH"
    exit 1
fi

PLY_SIZE=$(du -sh "$PLY_PATH" | cut -f1)
PLY_SIZE_MB=$(du -m "$PLY_PATH" | cut -f1)

echo "  PIPELINE SUCCEEDED"
echo ""
echo "  Results:"
echo "    Output     : $PLY_PATH"
echo "    File size  : $PLY_SIZE"
echo "    Total time : ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo ""

# Sanity check file size
if [ "$PLY_SIZE_MB" -lt 5 ]; then
    echo "  WARNING: .ply is very small (${PLY_SIZE}). Reconstruction may be poor."
    echo "           Try with a better video or more steps."
elif [ "$PLY_SIZE_MB" -gt 500 ]; then
    echo "  NOTE: .ply is large (${PLY_SIZE}). Consider reducing steps or FPS for web delivery."
else
    echo "  File size looks healthy for a Gaussian Splat."
fi

echo ""
echo "  Per-stage timing (from process.py JSON output):"
echo "    Check the JSON lines above for per-stage 'total_time_s' values."
echo "    To extract timing programmatically:"
echo "      ./test_pipeline.sh /path/to/video.mp4 2>&1 | grep '\"total_time_s\"'"
echo ""
echo "  Next steps:"
echo "    1. View the .ply in your browser:"
echo "       → Drag and drop $PLY_PATH to https://playcanvas.com/viewer"
echo "       → Or https://supersplat.playcanvas.com"
echo ""
echo "    2. If it looks good, re-run with more steps for higher quality:"
echo "       ./test_pipeline.sh $VIDEO_PATH  (with STEPS=30000 in the script)"
echo ""
echo "    3. If COLMAP succeeded but the splat looks bad:"
echo "       - Check work/colmap/ directory for reconstruction quality"
echo "       - Try a slower video walkthrough"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
