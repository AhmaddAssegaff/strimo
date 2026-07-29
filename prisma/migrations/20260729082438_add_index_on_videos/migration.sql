-- This is an empty migration.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX videos_title_trgm_idx
ON videos
USING GIN (video_title gin_trgm_ops);

CREATE INDEX videos_description_trgm_idx
ON videos
USING GIN (video_description gin_trgm_ops);
