# EchoEstate — Project Context

EchoEstate is a full-stack portfolio web app where real estate agents upload 20–30s scene clips of key property spaces. Each clip is processed into a navigable 3D Gaussian Splat (.ply file) via a self-hosted COLMAP + OpenSplat GPU pipeline. The resulting splat views are arranged on a drag-and-drop View Map canvas so buyers can click a hotspot and step inside any scene.

**PRD version:** v1.3 (April 2026) — Timeline: 3–4 weeks (4 sprints)

---

## Monorepo Structure

```
echo-estate/
├── services/
│   ├── go-metadata/     # Go + Echo — Metadata API (port 8080)
│   └── node-api/        # Node.js + Express — Upload API + Auth (port 3001)
├── frontend/            # Next.js 14 + Tailwind CSS (port 3000)
└── worker/              # Docker — COLMAP + OpenSplat GPU handler (RunPod Serverless)
```

---

## Full Stack

| Layer | Tech | Responsibility |
|---|---|---|
| Discovery Frontend | Next.js 14 + Tailwind CSS | SSR listing pages, search, auth UI, View Map editor |
| View Map Canvas | React DnD | Drag-and-drop hotspot positioning, floor plan upload |
| 3D Viewer | Svelte + Three.js (antimatter15/splat) | Per-clip .ply rendering, orbit controls, metadata overlay |
| Upload API | Node.js / Express (port 3001) | File ingestion, R2 upload, RunPod Serverless job submission, JWT auth |
| Metadata API | Go / Echo (port 8080) | Property + clip CRUD, View Map layout persistence, bookmarks |
| GPU Worker | Docker (COLMAP + OpenSplat) | ffmpeg → COLMAP → OpenSplat per clip; RunPod Serverless endpoint handler |
| Primary DB | PostgreSQL (GORM) | Users, properties, clips, job statuses, bookmarks, View Map layouts |
| Cache | Redis | Session store, listing cache, RunPod job status cache |
| File Storage | Cloudflare R2 | Raw clip uploads + processed .ply files + floor plan images |
| Dev/Test GPU | NVIDIA A100 MIG 9 GB (LXD) | Local dev + COLMAP tuning |
| Production GPU | RunPod Serverless RTX 4090 (24 GB) | Production Gaussian Splatting jobs (~$0.74/hr, billed per second) |

**Deployment:** Vercel (frontend) + Fly.io (backend services) + RunPod Serverless (GPU worker)

---

## Go Metadata API — All Endpoints (port 8080)

| Method | Path | Description |
|---|---|---|
| GET | /properties | List properties. Query: page, limit, location, min_price, max_price, bedrooms |
| GET | /properties/:id | Property + clip list + View Map layout |
| POST | /properties | Create property record |
| PATCH | /properties/:id | Update property metadata |
| GET | /properties/:id/clips | List all scene clips with statuses |
| POST | /properties/:id/clips | Create a scene clip record |
| PATCH | /clips/:id | Update clip status + ply_url (called by Node.js polling) |
| GET | /properties/:id/viewmap | Get View Map layout JSON |
| PUT | /properties/:id/viewmap | Save/update View Map layout JSON |
| POST | /bookmarks | Save property to user bookmarks |
| DELETE | /bookmarks/:id | Remove a bookmark |
| GET | /health | Health check |

Pagination: cursor-based. Must be concurrent-safe (no race conditions on simultaneous requests).

---

## Node.js Upload API — All Endpoints (port 3001)

| Method | Path | Description |
|---|---|---|
| POST | /auth/register | Create new user account |
| POST | /auth/login | Login, receive JWT in HTTP-only cookie |
| POST | /auth/logout | Clear session cookie |
| POST | /upload/clip | Multipart: streams clip to R2, submits RunPod Serverless job, creates clip record |
| GET | /upload/clip/:id/status | Returns current clip processing status |
| POST | /upload/floorplan | Streams floor plan image to R2, returns URL |

Auth: JWT stored in HTTP-only cookies. Protected routes: upload, View Map editor, bookmarks.

---

## Database Schema

| Table | Key Columns | Notes |
|---|---|---|
| users | id, email, password_hash, created_at | Managed by Node.js auth service |
| properties | id, user_id, title, address, price, bedrooms, thumbnail_url, created_at | Core listing record |
| scene_clips | id, property_id, label, status, r2_clip_url, ply_url, created_at | status: queued / processing / ready / failed |
| gpu_jobs | id, clip_id, runpod_job_id, r2_clip_url, last_polled_at, steps | Tracks RunPod Serverless async job IDs |
| view_map_layouts | id, property_id, floor_plan_url, layout_json, updated_at | layout_json is array of bubble positions |
| bookmarks | user_id, property_id, created_at | Composite primary key |

### View Map layout_json structure

```json
{
  "floor_plan_url": "https://r2.example.com/floorplan.jpg",
  "bubbles": [
    { "clip_id": "abc123", "label": "Kitchen Island", "x": 0.22, "y": 0.41 },
    { "clip_id": "def456", "label": "Master Bedroom", "x": 0.71, "y": 0.29 }
  ]
}
```

x/y are normalised 0–1 values (fraction of canvas width/height) — resolution-independent.

---

## GPU Pipeline (per clip)

1. Agent uploads labelled 20–30s clip via Upload API
2. Node.js streams clip to Cloudflare R2, creates clip record (status: queued)
3. Node.js POSTs job to RunPod Serverless API with `{ r2_clip_url, clip_id, steps }`
4. RunPod routes to RTX 4090 worker running the registered Docker handler
5. Handler: ffmpeg extracts frames at 3–5 FPS, scaled to 960×540
6. Quality gate: < 30 frames extracted → return Failed
7. COLMAP runs Structure from Motion (feature extraction → matching → sparse reconstruction)
8. Quality gate: < 30 registered images → return Failed before OpenSplat
9. OpenSplat optimises Gaussian blobs (10,000–30,000 steps depending on clip length)
10. Handler uploads .ply to R2, returns `{ ply_url }` in output JSON
11. Node.js polls every 30s (`GET /status/{job_id}`), updates clip status to Ready + ply_url in DB
12. View Map canvas shows new hotspot bubble; buyer can click to load the splat

---

## Docker Worker Image

- Base: `nvidia/cuda:12.1-devel-ubuntu22.04`
- COLMAP 3.9+ compiled from source with CUDA
- OpenSplat compiled from source with CUDA + LibTorch
- RunPod Python SDK; `handler.py` implements `runpod.serverless.start()`
- Input: `{ r2_clip_url, clip_id, steps }` — Output: `{ ply_url }` or `{ error }`

---

## Sprint Plan

| Sprint | Days | Focus |
|---|---|---|
| Sprint 0 | 1–7 | GPU Worker: Docker build, RunPod Serverless registration, pipeline validation on A100 MIG |
| Sprint 1 | 8–14 | Foundation & Backend: Go metadata API + Node.js upload API |
| Sprint 2 | 15–21 | Frontend & Viewer: Next.js, View Map editor, Svelte 3D viewer |
| Sprint 3 | 22–28 | Deployment (Fly.io + Vercel), polish, demo seeding, README |

---

## Non-Functional Requirements

- 3D viewer: > 30 FPS on mid-range laptop (no dedicated GPU)
- Processing: < 15 min per clip on RTX 4090 Serverless; < 45 min on A100 MIG (dev)
- Cost: < $0.20 per scene clip via Serverless billing
- Security: no API keys exposed to browser — all RunPod and R2 calls are server-side only
- CORS: permissive in dev, tightened in Sprint 3
- Accessibility: WCAG AA contrast ratios, alt text on all images

## Out of Scope (V1)

- Real payment integration
- Real-time notifications (polling is sufficient)
- Automated test suite
- Webhook-based RunPod completion callbacks
- Stitching multiple clips into a single unified 3D scene
- Auto floor plan generation from clips
