const express = require("express");

const {
  addProductToCart,
  getLoggedUserCart,
  removeCartItem,
  clearCart,
  updateItemQuantity,
  applyCoupon,
} = require("../controller/cartContoller");
const { protect, restrictTo } = require("../controller/authController");

const router = express.Router();

router.use(protect, restrictTo("user"));
router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);
router.put("/applyCoupon", applyCoupon);

router.route("/:itemId").put(updateItemQuantity).delete(removeCartItem);

module.exports = router;
