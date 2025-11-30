/*
  Warnings:

  - You are about to drop the column `inside_au` on the `ShippingCharge` table. All the data in the column will be lost.
  - You are about to drop the column `outside_au` on the `ShippingCharge` table. All the data in the column will be lost.
  - The `region` column on the `ShippingCharge` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShippingRegion" AS ENUM ('INSIDE_AU', 'OUTSIDE_AU');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ShippingCharge" DROP COLUMN "inside_au",
DROP COLUMN "outside_au",
DROP COLUMN "region",
ADD COLUMN     "region" "ShippingRegion" NOT NULL DEFAULT 'INSIDE_AU';

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
