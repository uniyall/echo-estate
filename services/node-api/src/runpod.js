const axios = require('axios');
const db = require('./db');
const redis = require('./redis');

const RUNPOD_BASE = `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}`;
const METADATA_BASE = process.env.METADATA_API_URL || 'http://localhost:8080';

function runpodHeaders() {
  return { Authorization: `Bearer ${process.env.RUNPOD_API_KEY}` };
}

async function submitJob(r2ClipUrl, clipId, steps = 10000) {
  const { data } = await axios.post(
    `${RUNPOD_BASE}/run`,
    { input: { r2_clip_url: r2ClipUrl, clip_id: clipId, steps } },
    { headers: runpodHeaders() },
  );
  return data.id;
}

async function updateClipInMetadata(clipId, patch) {
  await axios.patch(`${METADATA_BASE}/clips/${clipId}`, patch);
}

async function pollJobs() {
  const jobIds = await redis.smembers('pending_runpod_jobs');
  if (!jobIds.length) return;

  for (const jobId of jobIds) {
    try {
      const { data } = await axios.get(`${RUNPOD_BASE}/status/${jobId}`, {
        headers: runpodHeaders(),
      });
      const { status, output } = data;
      const clipId = await redis.hget(`gpu_job:${jobId}`, 'clipId');
      if (!clipId) {
        await redis.srem('pending_runpod_jobs', jobId);
        continue;
      }

      if (status === 'COMPLETED') {
        await updateClipInMetadata(clipId, { status: 'ready', ply_url: output?.ply_url });
        await db.query('UPDATE gpu_jobs SET last_polled_at = NOW() WHERE runpod_job_id = $1', [jobId]);
        await redis.srem('pending_runpod_jobs', jobId);
        await redis.del(`gpu_job:${jobId}`);
        console.log(`[runpod] job ${jobId} completed — clip ${clipId} ready`);
      } else if (status === 'FAILED') {
        await updateClipInMetadata(clipId, { status: 'failed' });
        await redis.srem('pending_runpod_jobs', jobId);
        await redis.del(`gpu_job:${jobId}`);
        console.log(`[runpod] job ${jobId} failed — clip ${clipId} marked failed`);
      } else {
        await db.query('UPDATE gpu_jobs SET last_polled_at = NOW() WHERE runpod_job_id = $1', [jobId]);
      }
    } catch (err) {
      console.error(`[runpod] poll error for job ${jobId}:`, err.message);
    }
  }
}

async function recoverPendingJobs() {
  try {
    const { rows } = await db.query(`
      SELECT gj.runpod_job_id, gj.clip_id
      FROM gpu_jobs gj
      JOIN scene_clips sc ON sc.id = gj.clip_id
      WHERE sc.status IN ('queued', 'processing')
        AND gj.runpod_job_id IS NOT NULL AND gj.runpod_job_id != ''
    `);
    for (const row of rows) {
      await redis.hset(`gpu_job:${row.runpod_job_id}`, 'clipId', row.clip_id);
      await redis.sadd('pending_runpod_jobs', row.runpod_job_id);
    }
    if (rows.length) {
      console.log(`[runpod] recovered ${rows.length} pending GPU jobs into polling queue`);
    }
  } catch (err) {
    console.error('[runpod] failed to recover pending jobs:', err.message);
  }
}

function startPolling() {
  recoverPendingJobs();
  setInterval(pollJobs, 30_000);
}

module.exports = { submitJob, startPolling };
