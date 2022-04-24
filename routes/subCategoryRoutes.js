const express = require("express");

const {
  getsubcategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  createSubCategory,
  setCategoryId,
  filterobj,
  uploadSubCatImage,
  resizeSubCatImage,
} = require("../controller/subCategoriesController");
const {
  getsubCategoryValidator,
  createsubCategoryValidator,
  UpdatesubCategoryValidator,
  deletesubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");
const { protect, restrictTo } = require("../controller/authController");

// Allow params Categories
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(filterobj, getsubcategories)
  .post(
    protect,
    restrictTo("admin", "manager"),
    uploadSubCatImage,
    resizeSubCatImage,
    setCategoryId,
    createsubCategoryValidator,
    createSubCategory
  );

router
  .route("/:id")
  .get(getsubCategoryValidator, getSubCategory)
  .put(
    protect,
    restrictTo("admin", "manager"),
    uploadSubCatImage,
    resizeSubCatImage,
    UpdatesubCategoryValidator,
    updateSubCategory
  )
  .delete(
    protect,
    restrictTo("manager"),
    deletesubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
