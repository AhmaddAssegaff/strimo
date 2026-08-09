-- CreateEnum
CREATE TYPE "UPLOAD_STATUS" AS ENUM ('PENDING', 'UPLOADING', 'UPLOADED', 'SCANNING', 'CLEAN', 'INFECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "UPLOAD_TYPE" AS ENUM ('SINGLE', 'MULTIPART');

-- CreateEnum
CREATE TYPE "CHUNK_STATUS" AS ENUM ('PENDING', 'UPLOADED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "PROCESSING_STATUS" AS ENUM ('STARTED', 'PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "uploads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "video_id" UUID,
    "filename" VARCHAR(512) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "mime_type" VARCHAR(128) NOT NULL,
    "storage_key" VARCHAR(1024),
    "staging_key" VARCHAR(1024),
    "checksum_sha256" CHAR(64),
    "status" "UPLOAD_STATUS" NOT NULL DEFAULT 'PENDING',
    "upload_type" "UPLOAD_TYPE" NOT NULL DEFAULT 'SINGLE',
    "multipart_upload_id" VARCHAR(512),
    "total_chunks" INTEGER,
    "error_message" TEXT,
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
    "checksum_md5" CHAR(32),
    "status" "CHUNK_STATUS" NOT NULL DEFAULT 'PENDING',
    "uploaded_at" TIMESTAMPTZ,

    CONSTRAINT "upload_chunks_pkey" PRIMARY KEY ("chunk_id")
);

-- CreateTable
CREATE TABLE "upload_processing_events" (
    "event_id" BIGSERIAL NOT NULL,
    "upload_id" UUID NOT NULL,
    "stage" VARCHAR(64) NOT NULL,
    "status" "PROCESSING_STATUS" NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_processing_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "uploads_user_id_created_at_idx" ON "uploads"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "upload_chunks_upload_id_idx" ON "upload_chunks"("upload_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_chunks_upload_id_chunk_number_key" ON "upload_chunks"("upload_id", "chunk_number");

-- CreateIndex
CREATE INDEX "upload_processing_events_upload_id_idx" ON "upload_processing_events"("upload_id");

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_chunks" ADD CONSTRAINT "upload_chunks_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_processing_events" ADD CONSTRAINT "upload_processing_events_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
