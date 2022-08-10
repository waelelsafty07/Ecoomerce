const asyncHandler = require("express-async-handler");
const sharp = require("sharp");

const { v4: uuidv4 } = require("uuid");

const SubCategory = require("../model/subCategoryModel");
const Factory = require("./handlerFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddelware");

// uploads a single image
exports.uploadSubCatImage = uploadSingleImage("image");

// image processing

exports.resizeSubCatImage = asyncHandler(async (req, res, next) => {
  const filename = `subcategory-${uuidv4()}-${Date.now()}.webp`;
  if (req.file) {
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("webp")
    .webp({ quality: 85 })
    .toFile(`uploads/subcategories/${filename}`);
  req.body.image = filename;
  }
  next();
});
// Nested Routes 
// @desc  categories/categoryId/subcategories 

exports.filterobj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
/*  @desc   Get list of Subcategories
    @route  GET /api/v1/subcategories
    @access Public  
*/
exports.getsubcategories = Factory.getAll(SubCategory);
/*  @desc   Get specific SubCategory by id
    @route  GET /api/v1/subcategories/:id
    @access Public  
*/
exports.getSubCategory = Factory.getOne(SubCategory);

/*  @desc   Update specific SubCategory by id
    @route  PUT /api/v1/subcategories/:id
    @access Private/Admin Or Manager  
*/
exports.updateSubCategory = Factory.updateOne(SubCategory);

/*  @desc   Update specific SubCategory by id
    @route  Delete /api/v1/subcategories/:id
    @access Private/Manager
*/
exports.deleteSubCategory = Factory.deleteOne(SubCategory);

// Nested Route
exports.setCategoryId = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
/*  @desc   Create a new SubCategory
    @route  POST   /api/v1/subcategories
    @access Private/Admin Or Manager  
*/
exports.createSubCategory = Factory.createOne(SubCategory);
