const categoryRoute = require("./categoryRoutes");
const subcategoryRoute = require("./subCategoryRoutes");
const brandRoute = require("./brandRoutes");
const productRoute = require("./productRoutes");
const userRoute = require("./userRoutes");
const authRoute = require("./authRoutes");
const reviewRoute = require("./reviewRoutes");
const wishlistRoute = require("./wishlistRoute");
const addressRoute = require("./addressRoute");
const couponRoute = require("./couponRoute");
const cartRoute = require("./cartRoutes");
const orderRoute = require("./orderRoute");
const shipRocket = require("../middlewares/shiprocket");

const mountRoutes = (app, express) => {
  // limit
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/subcategories", subcategoryRoute);
  app.use("/api/v1/brands", brandRoute);
  app.use("/api/v1/products", productRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/reviews", reviewRoute);
  app.use("/api/v1/wishlists", wishlistRoute);
  app.use("/api/v1/addresses", addressRoute);
  app.use("/api/v1/coupons", couponRoute);
  app.use("/api/v1/carts", cartRoute);
  app.use("/api/v1/orders", shipRocket.token, orderRoute);
};

module.exports = mountRoutes;
