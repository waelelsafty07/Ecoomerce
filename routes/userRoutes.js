const express = require("express");

const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeUserImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require("../controller/userController");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  changeLoggedPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");
const { protect, restrictTo } = require("../controller/authController");

const router = express.Router();

// @desc middleware for resources protected

router.use(protect);

// @desc Logged User for resources protected to access

router.get("/getMe", getLoggedUserData, getUser);
router.put(
  "/updateMyPassword",
  changeLoggedPasswordValidator,
  updateLoggedUserPassword
);
router.put("/updateMyData", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUserData);

// @desc middleware for resources restrictTo

router.use(restrictTo("admin", "manager"));

// @desc Routes can admin allowed to use this

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeUserImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeUserImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);
module.exports = router;
