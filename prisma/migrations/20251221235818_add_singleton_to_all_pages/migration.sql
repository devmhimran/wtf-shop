/*
  Warnings:

  - A unique constraint covering the columns `[isSingleton]` on the table `AboutUs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[isSingleton]` on the table `PrivacyPolicy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[isSingleton]` on the table `ReturnsAndExchanges` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[isSingleton]` on the table `TermsAndConditions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AboutUs" ADD COLUMN     "isSingleton" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PrivacyPolicy" ADD COLUMN     "isSingleton" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ReturnsAndExchanges" ADD COLUMN     "isSingleton" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TermsAndConditions" ADD COLUMN     "isSingleton" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "AboutUs_isSingleton_key" ON "AboutUs"("isSingleton");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyPolicy_isSingleton_key" ON "PrivacyPolicy"("isSingleton");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnsAndExchanges_isSingleton_key" ON "ReturnsAndExchanges"("isSingleton");

-- CreateIndex
CREATE UNIQUE INDEX "TermsAndConditions_isSingleton_key" ON "TermsAndConditions"("isSingleton");
