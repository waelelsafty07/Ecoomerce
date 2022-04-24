const asyncHandler = require("express-async-handler");

const User = require("../model/userModel");

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlists
// @access  Protect / user
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.product },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
});
// @desc    Remove product to wishlist
// @route   DELETE /api/v1/wishlists
// @access  Protect / user
exports.removeProductToWishlist = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product removed successfully to your wishlist.",
  });
});

// @desc    Get wishlist logged User
// @route   GET /api/v1/wishlists
// @access  Protect / user
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
