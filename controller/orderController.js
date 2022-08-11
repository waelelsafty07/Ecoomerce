const dotenv = require("dotenv");

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const factory = require("./handlerFactory");
const ApiError = require("../utils/apiErorr");
const ShipRocket = require("../utils/shiprocket");

const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");

// After creating order, decrement product quantity, increment product sold
const afterCreateOrder = async (order, cart, cartId) => {
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};
// console.log(process.env.BASE_URL);
// @desc    create cash order
// @route   POST /api/v1/orders/cartId
// @access  Protected/User

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // get cart depend on cart ID
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) return next(new ApiError("No cart with this id", 404));
  // Get cash order price depend on cart user
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // create Order with Cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  // create Order in shiprocket
  /*
  shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    } 
  */
  const today = new Date().toISOString().slice(0, 10);
  console.log(req.body.shippingAddress.details);
  const data = {
    order_id: order.id,
    order_date: today,
    pickup_location: "TSF",
    channel_id: "",
    comment: "Reseller: ",
    billing_customer_name: req.user.name,
    billing_last_name: "",
    billing_address: req.body.billingAddress.details,
    billing_address_2: "Near Hokage House",
    billing_city: req.body.billingAddress.city,
    billing_pincode: req.body.billingAddress.postalCode,
    billing_state: req.body.billingAddress.state,
    billing_country: req.body.billingAddress.country,
    billing_email: req.user.email,
    billing_phone: req.body.billingAddress.phone,
    shipping_is_billing: req.body.shipping_is_billing,
    shipping_customer_name: req.body.shipping_customer_name,
    shipping_last_name: "",
    shipping_address: req.body.shippingAddress.details,
    shipping_address_2: "",
    shipping_city: req.body.shippingAddress.city,
    shipping_pincode: req.body.shippingAddress.postalCode,
    shipping_country: req.body.shippingAddress.country,
    shipping_state: req.body.shippingAddress.state,
    shipping_email: req.body.shipping_email,
    shipping_phone: req.body.shippingAddress.phone,
    order_items: cart.orderItems,
    payment_method: "COD",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: totalOrderPrice - cart.totalPriceAfterDiscount,
    sub_total: totalOrderPrice,
    length: 10,
    breadth: 15,
    height: 20,
    weight: 2.5,
  };

  const shipRocket = new ShipRocket(req.shipRocket);
  const shipRocketRes = await shipRocket.requestCreateOrder(data);
  // inc sold and decrease quantity
  console.log(shipRocketRes);
  order.order_id = shipRocketRes.data.order_id;
  order.save();
  // afterCreateOrder(order, cart, req.params.cartId);

  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  console.log(req.user._id);
  next();
});
// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findAllOrders = factory.getAll(Order);

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findSpecificOrder = factory.getOne(Order);

// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager

exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc    Get  checkout session from stripe and send
// @route   get /api/v1/orders/:id/deliver
// @access  Protected/user

exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // console.log(process.env.EMAIL_USER);
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        name: req.user.name,
        amount: totalOrderPrice * 100,
        currency: "egp",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/carts`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

// Create Card Order function
const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  // 4) After creating order, decrement product quantity, increment product sold
  afterCreateOrder(order, cart, cartId);
};

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  console.log(process.env.STRIPE_END_POINT);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_END_POINT
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    console.log("hi");
    createCardOrder(event.data.object);
  }
  res.status(200).json({ received: true });
});
