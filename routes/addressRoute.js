const express = require("express");

const { protect, restrictTo } = require("../controller/authController");

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../controller/addressController");

const {
  createAddressValidator,
  deleteAddressValidator,
} = require("../utils/validators/addressValidator");

const router = express.Router();

router.use(protect, restrictTo("user"));

router
  .route("/")
  .post(createAddressValidator, addAddress)
  .get(getLoggedUserAddresses);

router.delete("/:addressId", deleteAddressValidator, removeAddress);

module.exports = router;
