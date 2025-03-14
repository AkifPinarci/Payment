/*
  Warnings:

  - You are about to drop the column `chargeId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Payment_chargeId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "chargeId",
ADD COLUMN     "payerId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT;
