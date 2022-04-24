const express = require("express");

const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeBrandImage,
} = require("../controller/brandsController");
const {
  getBrandValidator,
  createBrandValidator,
  UpdateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidator");
const { protect, restrictTo } = require("../controller/authController");

const router = express.Router();
router
  .route("/")
  .get(getBrands)
  .post(
    protect,
    restrictTo("admin", "manager"),
    uploadBrandImage,
    resizeBrandImage,
    createBrandValidator,
    createBrand
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    protect,
    restrictTo("admin", "manager"),
    uploadBrandImage,
    resizeBrandImage,
    UpdateBrandValidator,
    updateBrand
  )
  .delete(protect, restrictTo("manager"), deleteBrandValidator, deleteBrand);
module.exports = router;
