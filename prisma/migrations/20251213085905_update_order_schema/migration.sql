/*
  Warnings:

  - You are about to drop the column `orderId` on the `CustomOrderImage` table. All the data in the column will be lost.
  - You are about to drop the column `customNote` on the `Order` table. All the data in the column will be lost.
  - Added the required column `email` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('PICKUP', 'SHIPPING');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INCOMPLETE', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "CustomOrderImage" DROP CONSTRAINT "CustomOrderImage_orderId_fkey";

-- AlterTable
ALTER TABLE "CustomOrderImage" DROP COLUMN "orderId",
ADD COLUMN     "imageName" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "orderItemId" INTEGER;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customNote",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'SHIPPING',
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'INCOMPLETE',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "stripeId" TEXT,
ADD COLUMN     "subTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "color" TEXT,
ADD COLUMN     "customNote" TEXT,
ADD COLUMN     "printSide" TEXT,
ADD COLUMN     "size" TEXT;

-- AddForeignKey
ALTER TABLE "CustomOrderImage" ADD CONSTRAINT "CustomOrderImage_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
