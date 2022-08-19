const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const Category = require("../model/categoryModel");
const Factory = require("./handlerFactory");

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

// uploads a single image
exports.uploadCategoryImage = uploadSingleImage("image");

// image processing

exports.resizeCategoryImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.webp`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("webp")
      .webp({ quality: 85 })
      .toFile(`uploads/categories/${filename}`);
    req.body.image = filename;
  }

  next();
});
/*  @desc   Get list of categories
    @route  GET /api/v1/categories
    @access Public  
*/


exports.getCategories = Factory.getAll(Category);

/*  @desc   Get specific category by id
    @route  GET /api/v1/categories/:id
    @access Public  
*/
exports.getCategory = Factory.getOne(Category);

/*  @desc   Update specific category by id
    @route  Put /api/v1/categories/:id
    @access Private/admin or manager  
*/
exports.updateCategory = Factory.updateOne(Category);

/*  @desc   Update specific category by id
    @route  Delete /api/v1/categories/:id
    @access Private/manager
*/
exports.deleteCategory = Factory.deleteOne(Category);

/*  @desc   Create a new category
    @route  POST   /api/v1/categories
    @access Private  
*/

exports.createCategory = Factory.createOne(Category);
