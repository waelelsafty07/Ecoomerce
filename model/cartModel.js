const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: String,
        sku: String,
        units: {
          type: Number,
          default: 1,
        },
        selling_price: Number,
        discount: Number,
        tax: Number,
        color: String,
        size: String,
        brand: String,
      },
    ],

    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        name: String,
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        size: String,
        price: Number,
        brand: String,
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
