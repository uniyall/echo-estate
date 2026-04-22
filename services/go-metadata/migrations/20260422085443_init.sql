-- Create "users" table
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "email" character varying(255) NOT NULL,
  "password_hash" character varying(255) NOT NULL,
  PRIMARY KEY ("id")
);
-- Create index "idx_users_email" to table: "users"
CREATE UNIQUE INDEX "idx_users_email" ON "public"."users" ("email");
-- Create "properties" table
CREATE TABLE "public"."properties" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "user_id" uuid NOT NULL,
  "title" character varying(255) NOT NULL,
  "address" text NOT NULL,
  "price" bigint NULL,
  "bedrooms" bigint NULL,
  "thumbnail_url" text NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_users_properties" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_properties_user_id" to table: "properties"
CREATE INDEX "idx_properties_user_id" ON "public"."properties" ("user_id");
-- Create "bookmarks" table
CREATE TABLE "public"."bookmarks" (
  "user_id" uuid NOT NULL,
  "property_id" uuid NOT NULL,
  "created_at" timestamptz NULL,
  PRIMARY KEY ("user_id", "property_id"),
  CONSTRAINT "fk_bookmarks_user" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_properties_bookmarks" FOREIGN KEY ("property_id") REFERENCES "public"."properties" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "scene_clips" table
CREATE TABLE "public"."scene_clips" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "property_id" uuid NOT NULL,
  "label" character varying(255) NOT NULL,
  "status" character varying(20) NULL DEFAULT 'queued',
  "r2_clip_url" text NULL,
  "ply_url" text NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_properties_scene_clips" FOREIGN KEY ("property_id") REFERENCES "public"."properties" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_scene_clips_property_id" to table: "scene_clips"
CREATE INDEX "idx_scene_clips_property_id" ON "public"."scene_clips" ("property_id");
-- Create "gpu_jobs" table
CREATE TABLE "public"."gpu_jobs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "clip_id" uuid NOT NULL,
  "runpod_job_id" character varying(255) NULL,
  "last_polled_at" timestamptz NULL,
  "steps" bigint NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_scene_clips_gpu_job" FOREIGN KEY ("clip_id") REFERENCES "public"."scene_clips" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_gpu_jobs_clip_id" to table: "gpu_jobs"
CREATE UNIQUE INDEX "idx_gpu_jobs_clip_id" ON "public"."gpu_jobs" ("clip_id");
-- Create "view_map_layouts" table
CREATE TABLE "public"."view_map_layouts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "property_id" uuid NOT NULL,
  "floor_plan_url" text NULL,
  "layout_json" jsonb NULL DEFAULT '{"bubbles": []}',
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_properties_view_map_layout" FOREIGN KEY ("property_id") REFERENCES "public"."properties" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_view_map_layouts_property_id" to table: "view_map_layouts"
CREATE UNIQUE INDEX "idx_view_map_layouts_property_id" ON "public"."view_map_layouts" ("property_id");
