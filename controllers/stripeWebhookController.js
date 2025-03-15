const {
  updatePaymentStatus,
  insertPaymentIntent,
  getPaymentStatus,
  updatePaymentStatusByCheckoutSessionId,
  updatePaymentReceiptUrl,
} = require("../utils/webhook/utils.js");
const asyncHandler = require("../utils/asyncHandler");

const stripeWebhook = asyncHandler(async (request, response) => {
  const event = request.stripeEvent;

  switch (event.type) {
    case "charge.failed":
      await updatePaymentStatus(event.data.object.payment_intent, "failed");
      break;

    case "payment_intent.payment_failed":
      await updatePaymentStatus(event.data.object.id, "failed");
      break;

    case "checkout.session.completed":
      await insertPaymentIntent(
        event.data.object.id,
        event.data.object.payment_intent
      );
      break;

    case "payment_intent.created":
      await updatePaymentStatus(event.data.object.id, "pi_created");
      break;

    case "payment_intent.succeeded":
      // Add a 5-second delay before processing
      let receiptUrl = null;
      if (event.data.object.charges?.data?.[0]?.receipt_url) {
        receiptUrl = event.data.object.charges.data[0].receipt_url;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      const paymentStatus = await getPaymentStatus(event.data.object.id);

      if (paymentStatus === "pi_created") {
        await updatePaymentStatus(event.data.object.id, "succeeded");
        if (receiptUrl) {
          await updatePaymentReceiptUrl(event.data.object.id, receiptUrl);
        }
      } else {
        console.log(
          `Skipping payment_intent.succeeded for ${event.data.object.id} - payment intent not created yet`
        );
      }
      break;

    case "payment_intent.cancelled":
      await updatePaymentStatus(event.data.object.id, "pi_cancelled");
      break;

    case "checkout.session.expired":
      if (event.data.object.payment_intent) {
        await insertPaymentIntent(
          event.data.object.id,
          event.data.object.payment_intent
        );
        await updatePaymentStatus(event.data.object.payment_intent, "expired");
      } else {
        await updatePaymentStatusByCheckoutSessionId(
          event.data.object.id,
          "expired"
        );
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  response.json({ received: true });
});

module.exports = {
  stripeWebhook,
};
