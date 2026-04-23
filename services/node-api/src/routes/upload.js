const express = require('express');
const busboy = require('busboy');
const { Upload } = require('@aws-sdk/lib-storage');
const { randomUUID } = require('crypto');
const axios = require('axios');
const r2 = require('../r2');
const db = require('../db');
const redis = require('../redis');
const { requireAuth } = require('../middleware/auth');
const { submitJob } = require('../runpod');

const router = express.Router();

const METADATA_BASE = process.env.METADATA_API_URL || 'http://localhost:8080';

function streamToR2(fileStream, key, mimeType) {
  return new Upload({
    client: r2,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: mimeType,
    },
  }).done();
}

router.post('/clip', requireAuth, (req, res) => {
  const bb = busboy({ headers: req.headers });
  const fields = {};
  let uploadPromise = null;
  let r2Key = null;

  bb.on('field', (name, val) => {
    fields[name] = val;
  });

  bb.on('file', (fieldname, fileStream, info) => {
    if (fieldname !== 'clip') {
      fileStream.resume();
      return;
    }
    const { mimeType, filename } = info;
    const ext = (filename || 'mp4').split('.').pop();
    r2Key = `clips/${randomUUID()}.${ext}`;
    uploadPromise = streamToR2(fileStream, r2Key, mimeType);
  });

  bb.on('error', (err) => {
    console.error('[upload] busboy error:', err.message);
    if (!res.headersSent) res.status(400).json({ error: 'Multipart parse error' });
  });

  bb.on('finish', async () => {
    try {
      if (!uploadPromise) {
        return res.status(400).json({ error: '"clip" file field required' });
      }
      await uploadPromise;

      const { propertyId, label, steps = '10000' } = fields;
      if (!propertyId || !label) {
        return res.status(400).json({ error: 'propertyId and label fields required' });
      }

      const r2Url = `${process.env.R2_PUBLIC_URL}/${r2Key}`;

      // Create clip record in go-metadata
      const { data: clip } = await axios.post(
        `${METADATA_BASE}/properties/${propertyId}/clips`,
        { label, status: 'queued', r2_clip_url: r2Url },
      );

      // Submit GPU job to RunPod
      const runpodJobId = await submitJob(r2Url, clip.id, parseInt(steps, 10));

      // Persist gpu_jobs row
      await db.query(
        `INSERT INTO gpu_jobs (clip_id, runpod_job_id, steps, last_polled_at)
         VALUES ($1, $2, $3, NOW())`,
        [clip.id, runpodJobId, parseInt(steps, 10)],
      );

      // Flip status to processing
      await axios.patch(`${METADATA_BASE}/clips/${clip.id}`, { status: 'processing' });

      // Track in Redis for polling loop
      await redis.hset(`gpu_job:${runpodJobId}`, 'clipId', clip.id);
      await redis.sadd('pending_runpod_jobs', runpodJobId);

      res.status(201).json({
        clip_id: clip.id,
        status: 'processing',
        runpod_job_id: runpodJobId,
      });
    } catch (err) {
      console.error('[upload] clip error:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'Upload failed' });
    }
  });

  req.pipe(bb);
});

router.get('/clip/:id/status', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT sc.id, sc.status, sc.ply_url, sc.label,
              gj.runpod_job_id, gj.last_polled_at
       FROM scene_clips sc
       LEFT JOIN gpu_jobs gj ON gj.clip_id = sc.id
       WHERE sc.id = $1`,
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Clip not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[upload] status error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/floorplan', requireAuth, (req, res) => {
  const bb = busboy({ headers: req.headers });
  let uploadPromise = null;
  let r2Key = null;

  bb.on('file', (fieldname, fileStream, info) => {
    if (fieldname !== 'floorplan') {
      fileStream.resume();
      return;
    }
    const { mimeType, filename } = info;
    const ext = (filename || 'jpg').split('.').pop();
    r2Key = `floorplans/${randomUUID()}.${ext}`;
    uploadPromise = streamToR2(fileStream, r2Key, mimeType);
  });

  bb.on('error', (err) => {
    console.error('[upload] busboy error:', err.message);
    if (!res.headersSent) res.status(400).json({ error: 'Multipart parse error' });
  });

  bb.on('finish', async () => {
    try {
      if (!uploadPromise) {
        return res.status(400).json({ error: '"floorplan" file field required' });
      }
      await uploadPromise;
      res.json({ url: `${process.env.R2_PUBLIC_URL}/${r2Key}` });
    } catch (err) {
      console.error('[upload] floorplan error:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'Upload failed' });
    }
  });

  req.pipe(bb);
});

module.exports = router;
