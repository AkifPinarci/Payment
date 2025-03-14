/*
  Warnings:

  - You are about to drop the column `orderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentIntent` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentIntentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[checkoutSessionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chargeId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentIntentId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Payment_paymentIntent_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "orderId",
DROP COLUMN "paymentIntent",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "chargeId" TEXT,
ADD COLUMN     "checkoutSessionId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "paymentIntentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutSessionId_key" ON "Payment"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_chargeId_key" ON "Payment"("chargeId");
