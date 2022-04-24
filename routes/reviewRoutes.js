const express = require("express");

const {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  filterobj,
  setProductId,
} = require("../controller/reviewController");
const {
  createReviewValidator,
  getReviewValidator,
  UpdateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidator");
const { protect, restrictTo } = require("../controller/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(filterobj, getReviews)
  .post(
    protect,
    restrictTo("user"),
    setProductId,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(protect, restrictTo("user"), UpdateReviewValidator, updateReview)
  .delete(
    protect,
    restrictTo("user", "admin", "manager"),
    deleteReviewValidator,
    deleteReview
  );
module.exports = router;
