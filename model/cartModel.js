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

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "cartItems.product",
    select: "title -_id",
  });
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
