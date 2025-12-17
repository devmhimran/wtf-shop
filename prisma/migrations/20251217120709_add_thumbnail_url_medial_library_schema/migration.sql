/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `MediaLibrary` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileId` to the `MediaLibrary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaLibrary" ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MediaLibrary_fileId_key" ON "MediaLibrary"("fileId");
