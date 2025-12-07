-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
