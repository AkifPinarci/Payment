-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "payment_intent_id" TEXT,
    "checkout_session_id" TEXT,
    "receipt_url" TEXT,
    "payer_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "items" JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_payment_intent_id_key" ON "payment"("payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_checkout_session_id_key" ON "payment"("checkout_session_id");

-- CreateIndex
CREATE INDEX "payment_checkout_session_id_idx" ON "payment"("checkout_session_id");
