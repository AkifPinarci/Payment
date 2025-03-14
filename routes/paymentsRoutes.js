const express = require("express");
const router = express.Router();
const {
  createPayment,
  getReceiptUrl,
  getPayments,
} = require("../controllers/paymentsController");
const { storePaymentDetails } = require("../middlewares/paymentMiddleware");
const { query } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");

// Create a checkout session
router.post("/", storePaymentDetails, createPayment);

// Return all succeeded payments associated with the payerid
router.get(
  "/",
  [
    query("payerid").notEmpty().withMessage("payerid is required"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be between 1 and 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("offset must be a non-negative number"),
  ],
  validateRequest,
  getPayments
);

// Return all receipt URLs associated with the id
router.get(
  "/receipts",
  [query("paymentid").notEmpty().withMessage("paymentid is required")],
  validateRequest,
  getReceiptUrl
);

module.exports = router;
