const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const storePaymentDetails = async (req, res, next) => {
  let amount = 0;
  try {
    req.body.items.forEach((item) => {
      amount += item.price_data.unit_amount * item.quantity;
    });
  } catch (e) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  let newPayment;
  try {
    newPayment = await prisma.payment.create({
      data: {
        items: req.body.items,
        amount: amount,
        currency: "usd",
        status: "initiated",
        payerId: req.body.customerId,
      },
    });
    req.newPayment = newPayment.id;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  storePaymentDetails,
};
