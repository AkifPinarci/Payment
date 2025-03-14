const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPayment = async (req, res) => {
  try {
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
        checkoutSessionId: session.id,
        status: "created",
      },
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(505).json({ error: e.message });
  }
};

const getReceiptUrl = async (req, res) => {
  try {
    const { paymentid } = req.query;
    const payment = await prisma.payment.findUnique({
      where: { id: paymentid },
      select: {
        receiptUrl: true,
        status: true,
      },
    });
    if (!payment.receiptUrl) {
      return res.status(404).json({
        error: `Succeeded payment not found, status: ${payment.status}`,
      });
    }
    res.json({ receiptUrl: payment.receiptUrl });
  } catch (e) {
    res.status(505).json({ error: e.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const { payerid, status, offset, limit } = req.query;

    if (!payerid) {
      return res.status(400).json({
        error: "payerid is required",
      });
    }

    const skip = offset ? parseInt(offset) : 0;
    const take = limit ? parseInt(limit) : 10;
    if (take > 100) {
      return res
        .status(400)
        .json({ error: "Limit cannot be greater than 100" });
    }
    const whereClause = {
      payerId: payerid,
      ...(status && { status: status }),
    };
    const payments = await prisma.payment.findMany({
      where: whereClause,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        items: true,
      },
      skip,
      take,
    });
    res.json(payments);
  } catch (e) {
    res.status(505).json({ error: e.message });
  }
};

module.exports = {
  createPayment,
  getReceiptUrl,
  getPayments,
};
