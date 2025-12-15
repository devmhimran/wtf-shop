-- DropForeignKey
ALTER TABLE "ProductGallery" DROP CONSTRAINT "ProductGallery_mediaId_fkey";

-- AddForeignKey
ALTER TABLE "ProductGallery" ADD CONSTRAINT "ProductGallery_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
