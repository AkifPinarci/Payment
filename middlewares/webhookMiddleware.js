const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripeWebhookMiddleware = (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res
      .status(400)
      .json({ error: "Missing stripe signature or webhook secret" });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      webhookSecret
    );
    req.stripeEvent = event;
    next();
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
};

module.exports = stripeWebhookMiddleware;
