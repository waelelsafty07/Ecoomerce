const express = require("express");

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeCategoryImage,
  exportData,
} = require("../controller/categoriesController");
const { protect, restrictTo } = require("../controller/authController");
const {
  getCategoryValidator,
  createCategoryValidator,
  UpdateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");
const subCategoryRoutes = require("./subCategoryRoutes");
const productsRoutes = require("./productRoutes");

const router = express.Router();
router.route("/exportData").get(exportData);
router.use("/:categoryId/subcategories", subCategoryRoutes);
router.use("/:categoryId/products", productsRoutes);
router
  .route("/")
  .get(getCategories)
  .post(
    protect,
    restrictTo("admin", "manager"),
    uploadCategoryImage,
    resizeCategoryImage,
    createCategoryValidator,
    createCategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    protect,
    restrictTo("admin", "manager"),
    uploadCategoryImage,
    resizeCategoryImage,
    UpdateCategoryValidator,
    updateCategory
  )
  .delete(
    protect,
    restrictTo("manager"),
    deleteCategoryValidator,
    deleteCategory
  );
module.exports = router;
