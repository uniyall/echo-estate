# EchoEstate — Frontend Integration Guide

This document is the single source of truth for integrating the Next.js frontend with the two backend services. Read it end-to-end before writing any API calls.

---

## Services at a Glance

| Service | Base URL (dev) | Responsibility |
|---|---|---|
| **Node.js Upload API** | `http://localhost:3001` | Auth (register/login/logout), clip & floor plan upload, clip status polling |
| **Go Metadata API** | `http://localhost:8080` | Properties CRUD, clips list, View Map layout, bookmarks |

The frontend never calls RunPod or R2 directly — all cloud calls are server-side only.

---

## Authentication

Auth is handled entirely by the Node API. The Go Metadata API has **no auth middleware** — it is a trusted internal service and should not be called from the browser directly in production.

### How it works

1. `POST /auth/register` or `POST /auth/login` → Node API issues a **JWT stored in an HTTP-only cookie** named `token`.
2. Every subsequent request to the Node API automatically carries that cookie — no `Authorization` header needed.
3. The JWT payload contains `{ sub: "<user-uuid>", email: "<email>" }`.
4. Cookie settings: `httpOnly: true`, `sameSite: lax`, `maxAge: 24h`. `secure: true` in production only.

### Storing the user ID

The login/register response bodies include `{ id, email }`. Cache the `id` in client state (e.g. Zustand / React context). You will need it to call Go Metadata API endpoints that require `user_id`.

---

## Node.js API — `http://localhost:3001`

All requests must include `credentials: 'include'` so the browser sends the auth cookie.

### Auth endpoints

#### `POST /auth/register`

Create a new agent account.

**Request body** (JSON):
```json
{ "email": "agent@example.com", "password": "hunter2" }
```

**Success — 201:**
```json
{ "id": "550e8400-e29b-41d4-a716-446655440000", "email": "agent@example.com" }
```
Sets `token` cookie on the response.

**Errors:**

| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "email and password required" }` | Missing field |
| 409 | `{ "error": "Email already registered" }` | Duplicate email |
| 500 | `{ "error": "Internal server error" }` | DB failure |

---

#### `POST /auth/login`

**Request body** (JSON):
```json
{ "email": "agent@example.com", "password": "hunter2" }
```

**Success — 200:**
```json
{ "id": "550e8400-e29b-41d4-a716-446655440000", "email": "agent@example.com" }
```
Sets `token` cookie on the response.

**Errors:**

| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "email and password required" }` | Missing field |
| 401 | `{ "error": "Invalid credentials" }` | Wrong email/password |
| 500 | `{ "error": "Internal server error" }` | DB failure |

---

#### `POST /auth/logout`

No request body. Clears the `token` cookie.

**Success — 200:**
```json
{ "ok": true }
```

---

### Upload endpoints

All upload routes require the auth cookie. Return `401` if missing or expired.

#### `POST /upload/clip`

Upload a 20–30 s scene clip. Kicks off the full GPU pipeline.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `clip` | File | Yes | The video file (mp4, mov, etc.) |
| `propertyId` | string (UUID) | Yes | Existing property to attach clip to |
| `label` | string | Yes | Human label, e.g. "Kitchen Island" |
| `steps` | string (number) | No | OpenSplat training steps. Default `"10000"` |

**Success — 201:**
```json
{
  "clip_id": "abc123",
  "status": "processing",
  "runpod_job_id": "job-xyz"
}
```

**Errors:**

| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "\"clip\" file field required" }` | No file attached |
| 400 | `{ "error": "propertyId and label fields required" }` | Missing form fields |
| 400 | `{ "error": "Multipart parse error" }` | Malformed multipart body |
| 401 | `{ "error": "Unauthorized" }` | No/expired cookie |
| 500 | `{ "error": "Upload failed" }` | R2, RunPod, or DB failure |

**What happens internally:**
1. Streams the video file to Cloudflare R2 (`clips/{uuid}.{ext}`)
2. Creates a clip record in the Go Metadata API with `status: queued`
3. Submits the R2 URL to RunPod Serverless
4. Flips clip status to `processing`
5. Registers the job in Redis for background polling

---

#### `GET /upload/clip/:id/status`

Poll for clip processing status. Call this every 30 s until `status` is `ready` or `failed`.

**Path param:** `id` — clip UUID returned by `POST /upload/clip`

**Success — 200:**
```json
{
  "id": "abc123",
  "status": "processing",
  "ply_url": null,
  "label": "Kitchen Island",
  "runpod_job_id": "job-xyz",
  "last_polled_at": "2026-04-26T10:00:00Z"
}
```

When `status === "ready"`, `ply_url` is the public R2 URL of the `.ply` splat file.

**Status values:** `queued` | `processing` | `ready` | `failed`

**Errors:**

| Status | Body | Cause |
|---|---|---|
| 401 | `{ "error": "Unauthorized" }` | No/expired cookie |
| 404 | `{ "error": "Clip not found" }` | Unknown clip ID |
| 500 | `{ "error": "Internal server error" }` | DB failure |

---

#### `POST /upload/floorplan`

Upload a floor plan image for a property.

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `floorplan` | File | Yes |

**Success — 200:**
```json
{ "url": "https://pub-<hash>.r2.dev/floorplans/uuid.jpg" }
```

Store this URL in the View Map layout (see `PUT /properties/:id/viewmap`).

**Errors:**

| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "\"floorplan\" file field required" }` | No file attached |
| 401 | `{ "error": "Unauthorized" }` | No/expired cookie |
| 500 | `{ "error": "Upload failed" }` | R2 failure |

---

### Health

#### `GET /health`
```json
{ "ok": true }
```

---

## Go Metadata API — `http://localhost:8080`

This service is an internal API. In production it must not be exposed to the browser — proxy through Next.js API routes or the Node API. In development, calling it directly from the browser is acceptable.

**Note:** The Go API has no auth middleware. Do not rely on it for access control.

### Properties

#### `GET /properties`

List properties with optional filters and cursor-based pagination.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | number | Results per page (1–100, default 20) |
| `cursor` | string | Opaque base64 cursor from previous response's `next_cursor` |
| `location` | string | Case-insensitive substring match on `address` |
| `min_price` | number | Minimum price (inclusive) |
| `max_price` | number | Maximum price (inclusive) |
| `bedrooms` | number | Exact bedroom count |

**Success — 200:**
```json
{
  "properties": [
    {
      "id": "550e8400-...",
      "user_id": "...",
      "title": "Modern Downtown Loft",
      "address": "123 Main St, San Francisco",
      "price": 850000,
      "bedrooms": 2,
      "thumbnail_url": "https://...",
      "created_at": "2026-04-25T09:00:00Z",
      "updated_at": "2026-04-25T09:00:00Z"
    }
  ],
  "next_cursor": "MjAyNi0wNC0yNVQ..."
}
```

`next_cursor` is an empty string `""` on the last page. Pass it as `?cursor=` to fetch the next page. Results are ordered `created_at DESC`.

---

#### `GET /properties/:id`

Fetch a single property with its clip list and View Map layout preloaded.

**Success — 200:**
```json
{
  "id": "550e8400-...",
  "user_id": "...",
  "title": "Modern Downtown Loft",
  "address": "123 Main St, San Francisco",
  "price": 850000,
  "bedrooms": 2,
  "thumbnail_url": "https://...",
  "scene_clips": [
    {
      "id": "abc123",
      "property_id": "550e8400-...",
      "label": "Kitchen Island",
      "status": "ready",
      "r2_clip_url": "https://...",
      "ply_url": "https://.../output.ply",
      "created_at": "2026-04-25T10:00:00Z",
      "updated_at": "2026-04-25T10:30:00Z"
    }
  ],
  "view_map_layout": {
    "id": "...",
    "property_id": "...",
    "floor_plan_url": "https://.../floorplan.jpg",
    "layout_json": {
      "bubbles": [
        { "clip_id": "abc123", "label": "Kitchen Island", "x": 0.22, "y": 0.41 }
      ]
    },
    "created_at": "...",
    "updated_at": "..."
  },
  "created_at": "...",
  "updated_at": "..."
}
```

`scene_clips` is always an array (empty if none). `view_map_layout` is `null` if not yet saved.

**Errors:**

| Status | Body |
|---|---|
| 400 | `{ "error": "invalid property id" }` |
| 404 | `{ "error": "property not found" }` |
| 500 | `{ "error": "failed to fetch property" }` |

---

#### `POST /properties`

Create a new property listing.

**Request body** (JSON):
```json
{
  "user_id": "550e8400-...",
  "title": "Modern Downtown Loft",
  "address": "123 Main St, San Francisco",
  "price": 850000,
  "bedrooms": 2,
  "thumbnail_url": "https://..."
}
```

`user_id`, `title`, and `address` are required. `price`, `bedrooms`, `thumbnail_url` are optional (default zero/empty).

**Success — 201:** Returns the created property object (same shape as GET, without preloaded relations).

**Errors:**

| Status | Body |
|---|---|
| 400 | `{ "error": "title and address are required" }` |
| 400 | `{ "error": "user_id is required" }` |
| 500 | `{ "error": "failed to create property" }` |

---

#### `PATCH /properties/:id`

Partial update of a property. Send only the fields you want to change.

**Request body** (JSON — all fields optional):
```json
{
  "title": "Updated Title",
  "address": "456 New St",
  "price": 900000,
  "bedrooms": 3,
  "thumbnail_url": "https://..."
}
```

**Success — 200:** Returns updated property object.

**Errors:**

| Status | Body |
|---|---|
| 400 | `{ "error": "invalid property id" }` |
| 404 | `{ "error": "property not found" }` |
| 500 | `{ "error": "failed to update property" }` |

---

### Clips

The Go API manages clip records. The Node API manages clip uploads and status transitions. Use these endpoints for listing clips — don't update clip status from the frontend.

#### `GET /properties/:id/clips`

List all clips for a property, ordered `created_at ASC`.

**Success — 200:**
```json
{
  "clips": [
    {
      "id": "abc123",
      "property_id": "550e8400-...",
      "label": "Kitchen Island",
      "status": "ready",
      "r2_clip_url": "https://...",
      "ply_url": "https://.../output.ply",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

Fields `r2_clip_url` and `ply_url` are omitted from JSON when empty.

---

#### `POST /properties/:id/clips`

Manually create a clip record (used internally by the Node API — you rarely need this from the frontend).

**Request body** (JSON):
```json
{ "label": "Kitchen Island", "r2_clip_url": "https://..." }
```

**Success — 201:** Returns the created clip object with `status: "queued"`.

---

#### `PATCH /clips/:id`

Update clip status and/or `ply_url`. Called by the Node polling loop — do not call this from the frontend.

---

### View Map

#### `GET /properties/:id/viewmap`

Fetch the saved View Map layout for a property.

**Success — 200:**
```json
{
  "id": "...",
  "property_id": "550e8400-...",
  "floor_plan_url": "https://.../floorplan.jpg",
  "layout_json": {
    "bubbles": [
      { "clip_id": "abc123", "label": "Kitchen Island", "x": 0.22, "y": 0.41 },
      { "clip_id": "def456", "label": "Master Bedroom", "x": 0.71, "y": 0.29 }
    ]
  },
  "created_at": "...",
  "updated_at": "..."
}
```

**404** if no View Map has been saved yet for this property.

---

#### `PUT /properties/:id/viewmap`

Create or replace the View Map layout. This is an upsert — it creates if missing, otherwise replaces.

**Request body** (JSON):
```json
{
  "floor_plan_url": "https://.../floorplan.jpg",
  "layout_json": {
    "bubbles": [
      { "clip_id": "abc123", "label": "Kitchen Island", "x": 0.22, "y": 0.41 }
    ]
  }
}
```

`layout_json` is optional — defaults to `{ "bubbles": [] }` if omitted.

`x` and `y` are normalized 0–1 values (fraction of canvas width/height) so the layout is resolution-independent.

**Success — 200:** Returns the upserted layout object.

---

### Bookmarks

#### `GET /bookmarks?user_id=<uuid>`

Fetch all bookmarks for a user.

**Success — 200:**
```json
{
  "bookmarks": [
    {
      "user_id": "...",
      "property_id": "...",
      "created_at": "..."
    }
  ]
}
```

**Errors:**

| Status | Body |
|---|---|
| 400 | `{ "error": "user_id query param is required" }` |

---

#### `POST /bookmarks`

Add a bookmark.

**Request body** (JSON):
```json
{ "user_id": "...", "property_id": "..." }
```

**Success — 201:**
```json
{ "user_id": "...", "property_id": "...", "created_at": "..." }
```

**Errors:**

| Status | Body |
|---|---|
| 400 | `{ "error": "user_id and property_id are required" }` |

---

#### `DELETE /bookmarks/:id`

Remove a bookmark. `:id` is the **property_id** (not a bookmark primary key). The user is identified via a request header.

**Required header:** `X-User-ID: <user-uuid>`

**Success — 204:** Empty body.

**Errors:**

| Status | Body |
|---|---|
| 400 | `{ "error": "X-User-ID header is required" }` |
| 404 | `{ "error": "bookmark not found" }` |

---

### Health

#### `GET /health`
```json
{ "status": "ok" }
```

---

## Integration Flows

### 1. User registration / login

```
Browser                      Node API (3001)
  │─ POST /auth/register ──────────────────▶│
  │◀─ 201 { id, email } + Set-Cookie ───────│
  │
  │ Store user.id in app state
```

### 2. Create a property and upload a clip

```
Browser                      Node API (3001)           Go Metadata API (8080)
  │
  │─ POST /properties ──────────────────────────────────────────────────▶│
  │◀─ 201 { id: "prop-uuid", ... } ─────────────────────────────────────│
  │
  │─ POST /upload/floorplan (multipart) ────▶│
  │◀─ 200 { url: "https://r2.dev/..." } ────│
  │
  │─ PUT /properties/prop-uuid/viewmap ─────────────────────────────────▶│
  │  { floor_plan_url: "...", layout_json: { bubbles: [] } }             │
  │◀─ 200 { ... } ──────────────────────────────────────────────────────│
  │
  │─ POST /upload/clip (multipart) ─────────▶│
  │  clip file + propertyId + label          │─ POST /properties/prop-uuid/clips ──▶│
  │                                          │◀─ 201 { id: "clip-uuid", status: "queued" } ─│
  │                                          │─ RunPod submit ──▶ RunPod
  │                                          │─ PATCH /clips/clip-uuid { status: "processing" } ▶│
  │◀─ 201 { clip_id, status, runpod_job_id }│
  │
  │  (poll every 30s)
  │─ GET /upload/clip/clip-uuid/status ─────▶│
  │◀─ 200 { status: "processing", ... } ────│
  │
  │  (Node polling loop updates clip in background)
  │─ GET /upload/clip/clip-uuid/status ─────▶│
  │◀─ 200 { status: "ready", ply_url: "https://..." } ─│
  │
  │  Show hotspot in View Map, load .ply in 3D viewer
```

### 3. Browse listings

```
Browser                                         Go Metadata API (8080)
  │
  │─ GET /properties?limit=20&location=SF ─────────────────────────────▶│
  │◀─ 200 { properties: [...], next_cursor: "abc" } ────────────────────│
  │
  │─ GET /properties?limit=20&cursor=abc ──────────────────────────────▶│  (next page)
  │
  │─ GET /properties/:id ───────────────────────────────────────────────▶│
  │◀─ 200 { ..., scene_clips: [...], view_map_layout: {...} } ──────────│
```

### 4. View Map editor (drag-and-drop)

When the agent repositions a hotspot bubble:
1. Update local state with new `x`, `y` values.
2. Debounce saves (suggest 1–2 s delay after last drag).
3. `PUT /properties/:id/viewmap` with the full `layout_json` (replace, not merge).

```json
{
  "floor_plan_url": "https://...",
  "layout_json": {
    "bubbles": [
      { "clip_id": "abc123", "label": "Kitchen Island", "x": 0.30, "y": 0.45 }
    ]
  }
}
```

---

## TypeScript Types

Paste these into a shared `types/api.ts` file.

```typescript
// ── Auth ─────────────────────────────────────────────────────────────

export interface AuthResponse {
  id: string;
  email: string;
}

// ── Properties ───────────────────────────────────────────────────────

export interface Property {
  id: string;
  user_id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  thumbnail_url?: string;
  scene_clips: SceneClip[];
  view_map_layout: ViewMapLayout | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyListResponse {
  properties: Property[];
  next_cursor: string; // empty string on last page
}

export interface CreatePropertyPayload {
  user_id: string;
  title: string;
  address: string;
  price?: number;
  bedrooms?: number;
  thumbnail_url?: string;
}

export interface UpdatePropertyPayload {
  title?: string;
  address?: string;
  price?: number;
  bedrooms?: number;
  thumbnail_url?: string;
}

// ── Clips ─────────────────────────────────────────────────────────────

export type ClipStatus = 'queued' | 'processing' | 'ready' | 'failed';

export interface SceneClip {
  id: string;
  property_id: string;
  label: string;
  status: ClipStatus;
  r2_clip_url?: string;
  ply_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ClipUploadResponse {
  clip_id: string;
  status: 'processing';
  runpod_job_id: string;
}

export interface ClipStatusResponse {
  id: string;
  status: ClipStatus;
  ply_url: string | null;
  label: string;
  runpod_job_id: string;
  last_polled_at: string;
}

// ── View Map ──────────────────────────────────────────────────────────

export interface ViewMapBubble {
  clip_id: string;
  label: string;
  x: number; // 0–1, fraction of canvas width
  y: number; // 0–1, fraction of canvas height
}

export interface ViewMapLayoutJSON {
  bubbles: ViewMapBubble[];
}

export interface ViewMapLayout {
  id: string;
  property_id: string;
  floor_plan_url?: string;
  layout_json: ViewMapLayoutJSON;
  created_at: string;
  updated_at: string;
}

export interface UpsertViewMapPayload {
  floor_plan_url?: string;
  layout_json?: ViewMapLayoutJSON;
}

// ── Bookmarks ─────────────────────────────────────────────────────────

export interface Bookmark {
  user_id: string;
  property_id: string;
  created_at: string;
}
```

---

## Error Handling

All error responses from both services follow the same shape:

```json
{ "error": "<human-readable message>" }
```

Standard HTTP status codes apply. Suggested client-side handling:

| Status | Action |
|---|---|
| 400 | Show validation message to user |
| 401 | Redirect to `/login` |
| 404 | Show empty state or navigate back |
| 409 | Show "already exists" message |
| 500 | Show generic error toast, log to console |

---

## Fetch Utility Reference

Example base utility for Next.js (App Router):

```typescript
const NODE_API = process.env.NEXT_PUBLIC_NODE_API_URL ?? 'http://localhost:3001';
const META_API = process.env.NEXT_PUBLIC_META_API_URL ?? 'http://localhost:8080';

async function apiFetch<T>(
  base: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    credentials: 'include', // always send auth cookie
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const nodeApi = {
  get:    <T>(path: string, init?: RequestInit) => apiFetch<T>(NODE_API, path, { method: 'GET', ...init }),
  post:   <T>(path: string, body: unknown, init?: RequestInit) =>
    apiFetch<T>(NODE_API, path, { method: 'POST', body: JSON.stringify(body), ...init }),
  delete: <T>(path: string, init?: RequestInit) => apiFetch<T>(NODE_API, path, { method: 'DELETE', ...init }),
};

export const metaApi = {
  get:   <T>(path: string, init?: RequestInit) => apiFetch<T>(META_API, path, { method: 'GET', ...init }),
  post:  <T>(path: string, body: unknown, init?: RequestInit) =>
    apiFetch<T>(META_API, path, { method: 'POST', body: JSON.stringify(body), ...init }),
  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    apiFetch<T>(META_API, path, { method: 'PATCH', body: JSON.stringify(body), ...init }),
  put:   <T>(path: string, body: unknown, init?: RequestInit) =>
    apiFetch<T>(META_API, path, { method: 'PUT', body: JSON.stringify(body), ...init }),
  delete:<T>(path: string, init?: RequestInit) => apiFetch<T>(META_API, path, { method: 'DELETE', ...init }),
};
```

Multipart uploads must **not** pass `Content-Type: application/json` — let the browser set it automatically with the boundary:

```typescript
async function uploadClip(file: File, propertyId: string, label: string) {
  const form = new FormData();
  form.append('clip', file);
  form.append('propertyId', propertyId);
  form.append('label', label);

  const res = await fetch(`${NODE_API}/upload/clip`, {
    method: 'POST',
    credentials: 'include',
    body: form, // no Content-Type header — browser adds boundary automatically
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json() as Promise<ClipUploadResponse>;
}
```

---

## Environment Variables (Frontend)

```
NEXT_PUBLIC_NODE_API_URL=http://localhost:3001
NEXT_PUBLIC_META_API_URL=http://localhost:8080
```

In production, both services are private. Only `NODE_API_URL` should be public-facing (via Fly.io). The Go Metadata API must be proxied through Next.js API routes or the Node API to avoid direct browser access.

---

## Gotchas

- **`credentials: 'include'` is required** on every fetch to the Node API. Without it the auth cookie is not sent and you will get 401s.
- **Do not set `Content-Type` on multipart uploads.** The browser must set it with the boundary string.
- **Cursor pagination:** `next_cursor` is an empty string `""` (not `null`) on the last page. Check `!nextCursor` to stop fetching.
- **View Map upsert is a full replace.** Send the entire `bubbles` array every time, not just changed items.
- **Bookmark delete uses `X-User-ID` header, not a body.** The `:id` in the URL is the `property_id`.
- **`ply_url` is absent from JSON when empty** (Go `omitempty`). Check `clip.ply_url` for existence, not truthiness alone.
- **Go API IDs are UUIDs.** All `id` fields across both services are UUID v4 strings — treat them as opaque strings.
- **Clip list ordering:** `GET /properties/:id/clips` returns clips ordered `created_at ASC`. `GET /properties` returns properties `created_at DESC`.
- **Status polling:** The Node polling loop runs server-side every 30 s. Poll `GET /upload/clip/:id/status` every 30 s from the client — faster than that is unnecessary.
