const asyncHandler = require("express-async-handler");
const APIError = require("../utils/APIError");
const { sendSuccess } = require("../utils/sendResponse");
const Product = require("../model/productModel");
const Coupon = require("../model/couponModel");
const Cart = require("../model/cartModel");

const calculateTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};
// @desc    Add product to  cart
// @route   POST /api/v1/cart
// @access  Private/User

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color, size, quantity } = req.body;
  const product = await Product.findById(productId);
  const brandName = product.brand ? product.brand.name : null;
  const categoryName = product.category ? product.category.name : null;
  console.log(quantity);

  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    // create cart fot logged user with product
    const today = new Date();
    cart = await Cart.create({
      user: req.user._id,
      orderItems: [
        {
          name: product.title,
          sku: "today",
          units: quantity,
          selling_price: product.price,
          discount: "",
          tax: "",
        },
      ],
      cartItems: [
        {
          product: productId,
          color,
          size,
          quantity,
          total_quantity: product.quantity,
          brand: brandName,
          price: product.price,
        },
      ],
    });
  } else {
    const productIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.id.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      if (quantity > 1) cartItem.quantity += quantity;
      else cartItem.quantity += 1;
      const orderItem = cart.orderItems[productIndex];
      orderItem.units = cartItem.quantity;
      cart.orderItems[productIndex] = orderItem;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({
        product: productId,
        color,
        size,
        total_quantity: product.quantity,
        quantity: quantity,
        price: product.price,
      });
      cart.orderItems.push({
        name: product.title,
        sku: product.title,
        units: quantity,
        selling_price: product.price,
        discount: "",
        tax: "",
      });
    }
  }
  // calculate total price

  calculateTotalPrice(cart);
  await cart.save();

  sendSuccess(cart, 200, res, {
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
  });
});

// @desc    GET product to  From cart
// @route   GET /api/v1/cart
// @access  Private/User

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new APIError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  sendSuccess(cart, 200, res, {
    numOfCartItems: cart.cartItems.length,
  });
});

// @desc    Remove cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calculateTotalPrice(cart);
  cart.save();

  sendSuccess(cart, 200, res, {
    numOfCartItems: cart.cartItems.length,
  });
});

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  sendSuccess(null, 204, res);
});

// @desc    update quantity item of cartItems
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User

exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new APIError("Not Founded cart select items", 404));

  const productIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (productIndex > -1) {
    const cartItem = cart.cartItems[productIndex];
    cartItem.quantity = quantity;
    cart.cartItems[productIndex] = cartItem;
  } else {
    return next(new APIError("No item for this select again.", 404));
  }
  calculateTotalPrice(cart);
  await cart.save();
  sendSuccess(cart, 200, res, {
    message: "Cart item updated successfully",
    numOfCartItems: cart.cartItems.length,
  });
});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new APIError(`Coupon is invalid or expired`, 404));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new APIError(`No Cart is found`, 404));
  }
  const totalPrice = cart.totalCartPrice;

  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2); // 99.23

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  sendSuccess(cart, 200, res, {
    numOfCartItems: cart.cartItems.length,
  });
});
