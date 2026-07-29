-- CreateEnum
CREATE TYPE "VIDEO_STATUS" AS ENUM ('UPLOADING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "VIDEO_VISIBILITY" AS ENUM ('PRIVATE', 'PUBLIC', 'UNLISTED');

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "channel_id" UUID NOT NULL,
    "video_title" TEXT NOT NULL,
    "video_description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT NOT NULL,
    "status" "VIDEO_STATUS" NOT NULL DEFAULT 'UPLOADING',
    "visibility" "VIDEO_VISIBILITY" NOT NULL DEFAULT 'PRIVATE',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "videos_channel_id_idx" ON "videos"("channel_id");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
