const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiErorr");

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
  const { productId, color, size } = req.body;
  const product = await Product.findById(productId);
  const brandName = product.brand ? product.brand.name : null;
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    // create cart fot logged user with product
    cart = await Cart.create({
      user: req.user._id,
      orderItems: [
        {
          name: product.title,
          sku: product.title,
          selling_price: product.price,
          discount: "",
          tax: "",
          brand: brandName,
          color: color,
          size: size,
        },
      ],
      cartItems: [
        {
          product: productId,
          color,
          size,
          brand: brandName,
          price: product.price,
        },
      ],
    });
  } else {
    const productIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size &&
        item.brand === brandName
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      const orderItem = cart.orderItems[productIndex];
      orderItem.units = cartItem.quantity;
      cart.orderItems[productIndex] = orderItem;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({
        product: productId,
        brand: brandName,
        color,
        size,
        price: product.price,
      });
      cart.orderItems.push({
        name: product.title,
        sku: product.title,
        selling_price: product.price,
        discount: "",
        tax: "",
        brand: brandName,
        color: color,
        size: size,
      });
    }
  }
  // calculate total price

  calculateTotalPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    GET product to  From cart
// @route   GET /api/v1/cart
// @access  Private/User

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
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

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc    update quantity item of cartItems
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User

exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError("Not Founded cart select items", 404));

  const productIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (productIndex > -1) {
    const cartItem = cart.cartItems[productIndex];
    cartItem.quantity = quantity;
    cart.cartItems[productIndex] = cartItem;
  } else {
    return next(new ApiError("No item for this select again.", 404));
  }
  calculateTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
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
    return next(new ApiError(`Coupon is invalid or expired`, 404));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError(`No Cart is found`, 404));
  }
  const totalPrice = cart.totalCartPrice;

  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2); // 99.23

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
