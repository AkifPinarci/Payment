const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const paymentsRoutes = require("./routes/paymentsRoutes");
const webhookRoutes = require("./routes/stripeWebhookRoutes");
const healthcheckRoutes = require("./routes/healthcheckRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const morgan = require("morgan");

app.use(morgan("combined"));

// Apply body-parser to all routes except webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

app.use("/api/v1/payments", paymentsRoutes);
app.use(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  webhookRoutes
);
app.use("/api/v1/healthcheck", healthcheckRoutes);

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});

app.listen(process.env.PORT, () => {
  console.log(`Running on port ${process.env.PORT}`);
});
