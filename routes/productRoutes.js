const express = require("express");

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
  filterobj,
} = require("../controller/productsController");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");
const { protect, restrictTo } = require("../controller/authController");
const reviewRoutes = require("./reviewRoutes");

const router = express.Router({ mergeParams: true });
router.use("/:productId/reviews", reviewRoutes);
router
  .route("/")
  .get(filterobj, getProducts)
  .post(
    protect,
    restrictTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    protect,
    restrictTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    protect,
    restrictTo("manager"),
    deleteProductValidator,
    deleteProduct
  );
module.exports = router;
