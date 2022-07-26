const express = require("express");

const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  VerificationConfirm,
  protect,
} = require("../controller/authController");
const {
  signUpValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();
router.post("/signup", signUpValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post("/verifyResetCode", verifyResetCodeValidator, verifyPassResetCode);
router.put("/resetPassword", protect, resetPasswordValidator, resetPassword);

router.get("/confirm/activateAccount/:token", VerificationConfirm);
module.exports = router;
