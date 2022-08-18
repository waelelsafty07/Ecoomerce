require("dotenv").config();
const path = require("path");

const cron = require("node-cron");
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// const csrf = require("csurf");
const dbConnection = require("./config/database");

const ShipRocket = require("./utils/shiprocket");
const Redis = require("./utils/redis");

cron.schedule("* * 23 9 * *", async () => {
  try {
    const { status, data, message } = await new ShipRocket(null).login();

    // eslint-disable-next-line no-throw-literal
    if (!status) throw { message };
    await new Redis().set("token", data.token);
  } catch (e) {
    console.log(e.message);
  }
});

const APIError = require("./utils/APIError");
const globalError = require("./middlewares/errorMiddleware");
const appSecurity = require("./utils/appSecurity");
const { webhookCheckout } = require("./controller/orderController");
// Routes
const mountRoutes = require("./routes");

// connect to mongoose database
dbConnection();

const app = express();

// All app security  function
appSecurity(app);

// serve static files images in path /uploads

app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode:${process.env.NODE_ENV}`);
  console.log(`mode:${process.env.BASE_URL}`);
}
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Middlewares
app.use(
  express.json({
    limit: "1000kb",
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message:
    "Too many accounts created from this IP, please try again after an hour",
});
app.use("/api", limiter);

// const csrfProtection = csrf({ cookie: true });
app.use(cookieParser());

// app.use("/api/v1/auth", csrfProtection);
// app.get("/form", csrfProtection, (req, res) => {
//   // pass the csrfToken to the view
//   res.send(req.csrfToken());
// });
// Mount Routes

mountRoutes(app, express);

app.all("*", (req, res, next) => {
  // Create Error and send it to error handler
  next(new APIError(`Can't find this route ${req.originalUrl}`, 400));
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
