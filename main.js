const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const paymentsRoutes = require("./routes/paymentsRoutes");
const webhookRoutes = require("./routes/stripeWebhookRoutes");
const healthcheckRoutes = require("./routes/healthcheckRoutes");
const cors = require("cors");
const morgan = require("morgan");

app.use(morgan("combined"));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
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

app.listen(8080, () => {
  console.log("Running on port 8080");
});
