const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const APIError = require("../utils/APIError");
const User = require("../model/userModel");
const sendEmail = require("../utils/email");
const { sanitizeUser } = require("../utils/sanitizeData");
const generateToken = require("../utils/generateToken");
const { sendSuccess } = require("../utils/sendResponse");

const verify = async (user, req, res, next) => {
  // 2) Generate the random reset token
  const resetToken = user.createVerificationToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `<a  href="${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/confirm/activateAccount/${resetToken}"> Click Here </a>`;

    await sendEmail({
      email: user.email,
      subject: "Your Should Activate your account 24h",
      message: resetURL,
    });

    sendSuccess(null, 200, res, {
      message: "Verification confirm sent to email!",
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new APIError("There was an error sending the email. Try again later!"),
      500
    );
  }
};
/*  @desc   Sign Up User Account With Email
    @route  Post /api/v1/auth/signup
    @access Public  
*/

exports.VerificationConfirm = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log(hashedToken);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });
  console.log(user);

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    console.log("user not found");
    return next(new APIError("Token is invalid or has expired", 400));
  }
  user.emailVerificationVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  // 3) Generate Token
  // 4) Log the user in, send JWT
  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME, res);

  sendSuccess(sanitizeUser(user), 201, res, {
    message: "Email Verified Verify",
    token,
  });
});
exports.signup = asyncHandler(async (req, res, next) => {
  // Create User
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  verify(user, req, res, next);
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
    return next(new APIError("Incorrect email or password", 404));
  }
  if (!user.emailVerificationVerified) {
    return next(new APIError("Account not active", 401));
  }
  // generate token
  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME, res);

  // console.log(user);

  sendSuccess(sanitizeUser(user), 200, res, {
    token,
  });
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
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new APIError("You are not authenticated, Please login again", 401)
    );
  }
  // 2) verify token (no change ,expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) check if user exist
  const currentUser = await User.findById(decoded.userId).select("-password");
  if (!currentUser) {
    return next(
      new APIError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }
  // 4) check if user is active or not active
  if (!currentUser.emailVerificationVerified) {
    return next(new APIError("The user not active ", 401));
  }
  // 5) check if user change password after token created
  if (currentUser.passwordChangedAt) {
    const passChangetimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangetimestamp > decoded.iat) {
      return next(
        new APIError("User recently changed password, Please login again.", 401)
      );
    }
  }

  req.user = currentUser;
  next();
});
exports.isLoginUser = async (req, res, next) => {
  // 1) check if token is exist  if exist get token
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
      token = req.headers.authorization.split(" ")[1];
    else if (req.cookies.token) token = req.cookies.token;

    if (!token) return next();

    // 2) verify token (no change ,expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3) check if user exist
    const currentUser = await User.findById(decoded.userId).select("-password");
    if (!currentUser) return next();

    // 4) check if user is active or not active
    if (!currentUser.emailVerificationVerified) return next();
    // 5) check if user change password after token created
    if (currentUser.passwordChangedAt) {
      const passChangetimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );
      if (passChangetimestamp > decoded.iat) return next();
    }

    res.locals.user = currentUser;
    next();
  } catch (err) {
    next();
  }
};

// @desc user permission
exports.restrictTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new APIError("You do not have permission to perform this action", 403)
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
      new APIError(`there is no user with this email ${req.body.email}`, 404)
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
    return next(new APIError(`there is an error in sending email`, 500));
  }

  sendSuccess(null, 200, res, {
    message: "Reset code sent to email",
  });
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
    return next(new APIError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  const token = generateToken(
    user._id,
    process.env.JWT_EXPIRE_TIME_RESET_CODE,
    res
  );

  sendSuccess(null, 200, res, { token });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(
      new APIError(`There is no user with email ${req.user.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new APIError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME, res);
  sendSuccess(null, 200, res, { token });
});
