-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('STANDARD', 'CUSTOM');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productType" "ProductType";
