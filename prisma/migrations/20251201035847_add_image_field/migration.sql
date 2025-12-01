/*
  Warnings:

  - You are about to drop the column `alternativeImage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `mainImage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `ProductGallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "alternativeImage",
DROP COLUMN "mainImage",
ADD COLUMN     "alternativeImageId" INTEGER,
ADD COLUMN     "mainImageId" INTEGER;

-- AlterTable
ALTER TABLE "ProductGallery" DROP COLUMN "imageUrl",
ADD COLUMN     "mediaId" INTEGER;

-- CreateTable
CREATE TABLE "MediaLibrary" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "alt" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaLibrary_fileName_key" ON "MediaLibrary"("fileName");

-- AddForeignKey
ALTER TABLE "MediaLibrary" ADD CONSTRAINT "MediaLibrary_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_mainImageId_fkey" FOREIGN KEY ("mainImageId") REFERENCES "MediaLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_alternativeImageId_fkey" FOREIGN KEY ("alternativeImageId") REFERENCES "MediaLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductGallery" ADD CONSTRAINT "ProductGallery_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
