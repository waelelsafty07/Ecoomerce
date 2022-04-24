const express = require("express");

const {
  createCashOrder,
  filterOrderForLoggedUser,
  findAllOrders,
  findSpecificOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../controller/orderController");
const { protect, restrictTo } = require("../controller/authController");

const router = express.Router();
router.use(protect);

router.get("/checkout-session/:cartId", restrictTo("user"), checkoutSession);

router.route("/:cartId").post(restrictTo("user"), createCashOrder);

router
  .route("/")
  .get(
    restrictTo("user", "admin", "manager"),
    filterOrderForLoggedUser,
    findAllOrders
  );
router.route("/:id").get(findSpecificOrder);

// update status order
router.route("/:id/pay").put(restrictTo("admin", "manager"), updateOrderToPaid);
router
  .route("/:id/deliver")
  .put(restrictTo("admin", "manager"), updateOrderToDelivered);

module.exports = router;
