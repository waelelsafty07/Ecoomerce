const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiErorr");
const User = require("../model/userModel");
const sendEmail = require("../utils/email");

const generateToken = require("../utils/generateToken");

/*  @desc   Sign Up User Account With Email
    @route  Post /api/v1/auth/signup
    @access Public  
*/
exports.signup = asyncHandler(async (req, res, next) => {
  // Create User
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // Create Token
  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME);
  // genrate Token
  res.status(201).json({ data: user, token });
});

/*  @desc   Login User Account With Email
    @route  Post /api/v1/auth/login
    @access Public  
*/

exports.login = asyncHandler(async (req, res, next) => {
  // check user email & password is exist
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  if (!user.active) {
    return next(new ApiError("Account not active", 401));
  }
  // generate token
  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME);

  // console.log(user);
  res.status(201).json({ data: user, token });
});

// @desc make sure user is authenticated
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check if token is exist  if exist get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError("You are not authenticated, Please login again", 401)
    );
  }
  // 2) verify token (no change ,expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) check if user exist
  const currentUser = await User.findById(decoded.userId).select("-password");
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }
  // 4) check if user is active or not active
  if (!currentUser.active) {
    return next(new ApiError("The user not active ", 401));
  }
  // 5) check if user change password after token created
  if (currentUser.passwordChangedAt) {
    const passChangetimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangetimestamp > decoded.iat) {
      return next(
        new ApiError("User recently changed password, Please login again.", 401)
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc user permission
exports.restrictTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to perform this action", 403)
      );
    }

    next();
  });

/*  @desc   Forgot password User Account With Email
    @route  Post /api/v1/auth/forgotPassword
    @access Public  
*/
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get User body
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with this email ${req.body.email}`, 404)
    );
  }
  // 2) if user exist generate reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // Save hashedCode in Db
  user.passwordResetCode = hashedCode;
  // Add expiration code time for reset reset code
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  // 3) Send the reset code vai email
  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError(`there is an error in sending email`, 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  const token = generateToken(user._id, process.env.EXPIRE_TIME_RESET_CODE);
  res.status(200).json({
    status: "Success",
    token,
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.user.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME);
  res.status(200).json({ token });
});
