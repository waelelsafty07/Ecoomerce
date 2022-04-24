const express = require("express");
const { protect, restrictTo } = require("../controller/authController");

const {
  addProductToWishlist,
  removeProductToWishlist,
  getLoggedUserWishlist,
} = require("../controller/wishlistController");

const router = express.Router();

router.use(protect, restrictTo("user"));

router.route("/").get(getLoggedUserWishlist).post(addProductToWishlist);

router.delete("/:productId", removeProductToWishlist);

module.exports = router;
