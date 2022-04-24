const express = require("express");

const {
  createCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controller/couponController");
// const {} = require("../utils/validators/brandValidator");
const { protect, restrictTo } = require("../controller/authController");

const router = express.Router();
router.use(protect, restrictTo("admin", "manager"));
router.route("/").get(getCoupons).post(createCoupon);
router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);
module.exports = router;
