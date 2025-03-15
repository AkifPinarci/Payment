const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const AppError = require("../../errors/AppError");

// We get the data from our database and update the payment intent id and checkout session id in our database
const insertPaymentIntent = async (checkoutSessionId, payment_intent) => {
  try {
    await prisma.payment.update({
      where: { checkout_session_id: checkoutSessionId },
      data: { payment_intent_id: payment_intent },
    });
  } catch (e) {
    console.error(
      `Failed to update payment intent ${payment_intent}: ${e.message}`
    );
    throw AppError.internal(`Failed to update payment intent: ${e.message}`);
  }
};

// We get the data from Stripe API and update the payment intent id and checkout session id in our database
const getCheckoutSessionFromPaymentIntent = async (paymentIntentId) => {
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId, // Search by payment intent ID
    limit: 1,
  });
  if (sessions.data.length > 0) {
    await prisma.payment.update({
      where: { checkout_session_id: sessions.data[0].id },
      data: {
        payment_intent_id: paymentIntentId,
        stripe_customer_id: sessions.data[0].id.customer,
      },
    });
    return sessions.data[0].id; // Return the Checkout Session ID
  } else {
    return null;
  }
};

const updatePaymentStatus = async (payment_intent_id, status) => {
  const payments = await prisma.payment.findMany({
    where: { payment_intent_id: payment_intent_id },
  });
  if (payments.length === 0) {
    await getCheckoutSessionFromPaymentIntent(payment_intent_id);
  }
  try {
    await prisma.payment.update({
      where: { payment_intent_id: payment_intent_id },
      data: { status: status },
    });
  } catch (e) {
    console.error(
      `Failed to update payment ${payment_intent_id}: ${e.message}`
    );
    throw AppError.internal(`Failed to update payment status: ${e.message}`);
  }
};

const getPaymentStatus = async (payment_intent_id) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { payment_intent_id: payment_intent_id },
    });
    return payment ? payment.status : null;
  } catch (e) {
    console.error(
      `Failed to get payment status for ${payment_intent_id}: ${e.message}`
    );
    throw AppError.internal(`Failed to get payment status: ${e.message}`);
  }
};

const updatePaymentStatusByCheckoutSessionId = async (
  checkoutSessionId,
  status
) => {
  try {
    await prisma.payment.update({
      where: { checkout_session_id: checkoutSessionId },
      data: { status: status },
    });
  } catch (e) {
    console.error(
      `Failed to update payment status for ${checkoutSessionId}: ${e.message}`
    );
    throw AppError.internal(
      `Failed to update payment status by checkout session: ${e.message}`
    );
  }
};

const updatePaymentReceiptUrl = async (payment_intent_id, receiptUrl) => {
  try {
    await prisma.payment.update({
      where: { payment_intent_id: payment_intent_id },
      data: { receipt_url: receiptUrl },
    });
  } catch (e) {
    console.error(
      `Failed to update receipt URL for ${payment_intent_id}: ${e.message}`
    );
    throw AppError.internal(`Failed to update receipt URL: ${e.message}`);
  }
};

module.exports = {
  insertPaymentIntent,
  updatePaymentStatus,
  getPaymentStatus,
  updatePaymentStatusByCheckoutSessionId,
  updatePaymentReceiptUrl,
};
