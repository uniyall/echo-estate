# handler.py  — add this file alongside process.py
import runpod
import os
import subprocess
import sys

def handler(job):
    job_input = job["input"]

    # Inject per-job values into environment
    os.environ["R2_VIDEO_URL"]  = job_input["r2_video_url"]
    os.environ["PROPERTY_ID"]   = job_input["property_id"]
    os.environ["STEPS"]         = str(job_input.get("steps", 30000))

    # Run the pipeline as a subprocess so its stdout/exit code are captured
    result = subprocess.run(
        ["python3", "/worker/process.py"],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        return {"success": False, "error": result.stdout[-2000:]}

    # Parse the final JSON line emitted by process.py
    import json
    for line in reversed(result.stdout.splitlines()):
        try:
            data = json.loads(line)
            if "success" in data:
                return data
        except Exception:
            continue

    return {"success": False, "error": "No result JSON found in output"}

runpod.serverless.start({"handler": handler})