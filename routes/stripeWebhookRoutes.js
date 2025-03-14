const express = require("express");
const router = express.Router();
const { stripeWebhook } = require("../controllers/stripeWebhookController");
const stripeWebhookMiddleware = require("../middlewares/webhookMiddleware");

// Apply the webhook middleware to verify Stripe signatures
router.post("/", stripeWebhookMiddleware, stripeWebhook);

module.exports = router;
