const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

const dbConnection = require("./config/database");

const ApiError = require("./utils/apiErorr");
const globalError = require("./middlewares/errorMiddelware");
const { webhookCheckout } = require("./controller/orderController");
// Routes
const mountRoutes = require("./routes");

dotenv.config();
// connect to mongoose database
dbConnection();

const app = express();
app.use(cors());
app.options("*", cors());
app.use(compression());

app.use(express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode:${process.env.NODE_ENV}`);
  console.log(`mode:${process.env.BASE_URL}`);
}

// Middlewares
app.use(express.json());

// Mount Routes
// eslint-disable-next-line no-unused-expressions

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }, webhookCheckout)
);

mountRoutes(app);

app.all("*", (req, res, next) => {
  // Create Error and send it to error handler
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 400));
});
// Global Errors handling middleware
app.use(globalError);
// Ports
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

// handling Rejection Errors
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
