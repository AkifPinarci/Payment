const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../errors/AppError");

const createPayment = asyncHandler(async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: req.body.items,
    success_url: req.body.success_url,
    cancel_url: req.body.cancel_url,
    expires_at: Math.floor(Date.now() / 1000) + 1800,
    payment_intent_data: {
      metadata: { postgresCustomerId: req.body.customerId },
    },
  });

  await prisma.payment.update({
    where: { id: req.newPayment },
    data: {
      checkout_session_id: session.id,
      status: "created",
    },
  });

  res.json({ url: session.url });
});

const getReceiptUrl = asyncHandler(async (req, res) => {
  const { paymentid } = req.query;
  const payment = await prisma.payment.findUnique({
    where: { id: paymentid },
    select: {
      receipt_url: true,
      status: true,
    },
  });

  if (!payment.receipt_url) {
    throw AppError.notFound(
      `Succeeded payment not found, status: ${payment.status}`
    );
  }

  res.json({ receiptUrl: payment.receipt_url });
});

const getPayments = asyncHandler(async (req, res) => {
  const { payerid, status, offset, limit } = req.query;

  if (!payerid) {
    throw AppError.badRequest("payerid is required");
  }

  const skip = offset ? parseInt(offset) : 0;
  const take = limit ? parseInt(limit) : 10;
  const whereClause = {
    payer_id: payerid,
    ...(status && { status: status }),
  };

  const payments = await prisma.payment.findMany({
    where: whereClause,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      created_at: true,
      items: true,
    },
    skip,
    take,
  });

  res.json(payments);
});

module.exports = {
  createPayment,
  getReceiptUrl,
  getPayments,
};
