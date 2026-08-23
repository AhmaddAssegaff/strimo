-- CreateEnum
CREATE TYPE "VIDEO_STATUS" AS ENUM ('DRAFT', 'PROCESSING', 'READY');

-- CreateEnum
CREATE TYPE "VIDEO_VISIBILITY" AS ENUM ('PRIVATE', 'PUBLIC', 'UNLISTED');

-- CreateEnum
CREATE TYPE "UPLOAD_STATUS" AS ENUM ('PENDING', 'UPLOADING', 'UPLOADED', 'FAILED');

-- CreateEnum
CREATE TYPE "UPLOAD_TYPE" AS ENUM ('SINGLE', 'MULTIPART');

-- CreateEnum
CREATE TYPE "CHUNK_STATUS" AS ENUM ('PENDING', 'UPLOADED', 'VERIFIED');

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "channel_id" UUID NOT NULL,
    "video_title" TEXT NOT NULL,
    "video_description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "hls_key" TEXT,
    "dash_key" TEXT,
    "thumbnail" TEXT,
    "status" "VIDEO_STATUS" NOT NULL DEFAULT 'DRAFT',
    "visibility" "VIDEO_VISIBILITY" NOT NULL DEFAULT 'PRIVATE',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "video_id" UUID NOT NULL,
    "filename" VARCHAR(512) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "mime_type" VARCHAR(128) NOT NULL,
    "chunk_size" INTEGER,
    "temp_object_key" VARCHAR(1024) NOT NULL,
    "status" "UPLOAD_STATUS" NOT NULL DEFAULT 'PENDING',
    "upload_type" "UPLOAD_TYPE" NOT NULL DEFAULT 'MULTIPART',
    "multipart_upload_id" VARCHAR(512) NOT NULL,
    "total_chunks" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_chunks" (
    "chunk_id" BIGSERIAL NOT NULL,
    "upload_id" UUID NOT NULL,
    "chunk_number" INTEGER NOT NULL,
    "byte_offset" BIGINT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "etag" VARCHAR(128),
    "sha256" VARCHAR(128),
    "status" "CHUNK_STATUS" NOT NULL DEFAULT 'PENDING',
    "uploaded_at" TIMESTAMPTZ,

    CONSTRAINT "upload_chunks_pkey" PRIMARY KEY ("chunk_id")
);

-- CreateIndex
CREATE INDEX "videos_channel_id_idx" ON "videos"("channel_id");

-- CreateIndex
CREATE INDEX "uploads_user_id_created_at_idx" ON "uploads"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "upload_chunks_upload_id_idx" ON "upload_chunks"("upload_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_chunks_upload_id_chunk_number_key" ON "upload_chunks"("upload_id", "chunk_number");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_chunks" ADD CONSTRAINT "upload_chunks_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
