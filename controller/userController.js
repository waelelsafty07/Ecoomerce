const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");
const APIError = require("../utils/APIError");
const User = require("../model/userModel");
const Factory = require("./handlerFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const generateToken = require("../utils/generateToken");

// filter requests body
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
// uploads a single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// image processing

exports.resizeUserImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.webp`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("webp")
      .webp({ quality: 85 })
      .toFile(`uploads/users/${filename}`);
    req.body.profileImg = filename;
  }
  next();
});
/*  @desc   Get list of users
    @route  GET /api/v1/users
    @access Private/Admin  
*/
exports.getUsers = Factory.getAll(User);

/*  @desc   Get specific user by id
    @route  GET /api/v1/users/:id
    @access Private/Admin/Admin  
*/
exports.getUser = Factory.getOne(User);

/*  @desc   Update specific user by id
    @route  PUT /api/v1/users/:id
    @access Private/Admin  
*/

exports.updateUser = asyncHandler(async (req, res, next) => {
  const filterBody = filterObj(
    req.body,
    "name",
    "phone",
    "email",
    "profileImg",
    "role",
    "active"
  );
  const user = await User.findByIdAndUpdate(req.params.id, filterBody, {
    new: true,
  });

  if (!user) {
    return next(new APIError(`No User for this id: ${req.params.id}`, 400));
  }
  res.status(200).json({ data: user });
});

/*  @desc   Update Password user by id
    @route  PUT /api/v1/users/:id
    @access Private/Admin  
*/

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new APIError(`No User for this id${req.params.id}`, 400));
  }
  res.status(200).json({ data: user });
});
/*  @desc   Update specific user by id
    @route  Delete /api/v1/users/:id
    @access Private/Admin  
*/
exports.deleteUser = Factory.deleteOne(User);

/*  @desc   Create a new user
    @route  POST   /api/v1/users
    @access Private/Admin  
*/
exports.createUser = Factory.createOne(User);

/*  @desc   Get Logged user data
    @route  GET   /api/v1/users/getm
    @access Private/protect  
*/
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

/*  @desc   Update Logged user data
    @route  PUT   /api/v1/users/updateMyPassword
    @access Private/protect  
*/
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME, res);
  res.status(200).json({ data: user, token });
});

/*  @desc   Update Logged user data
    @route  PUT   /api/v1/users/updateMyData
    @access Private/protect  
*/

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const filterBody = filterObj(
    req.body,
    "name",
    "phone",
    "email",
    "profileImg"
  );
  const user = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
  });
  res.status(200).json({ data: user });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "Success" });
});
