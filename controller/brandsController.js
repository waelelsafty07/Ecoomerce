const asyncHandler = require("express-async-handler");
const sharp = require("sharp");

const { v4: uuidv4 } = require("uuid");

const Brand = require("../model/brandModel");
const Factory = require("./handlerFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddelware");

// uploads a single image
exports.uploadBrandImage = uploadSingleImage("image");

// image processing

exports.resizeBrandImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.webp`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("webp")
    .webp({ quality: 85 })
    .toFile(`uploads/brands/${filename}`);
  req.body.image = filename;
  next();
});
/*  @desc   Get list of brand
    @route  GET /api/v1/brands
    @access Public  
*/
exports.getBrands = Factory.getAll(Brand);

/*  @desc   Get specific brand by id
    @route  GET /api/v1/brands/:id
    @access Public  
*/
exports.getBrand = Factory.getOne(Brand);

/*  @desc   Update specific brand by id
    @route  Put /api/v1/brands/:id
    @access Private/admin or manager  
*/
exports.updateBrand = Factory.updateOne(Brand);

/*  @desc   Update specific brand by id
    @route  Delete /api/v1/brands/:id
    @access Private/Manager 
*/
exports.deleteBrand = Factory.deleteOne(Brand);

/*  @desc   Create a new brand
    @route  POST   /api/v1/brands
    @access Private/admin or manager
*/
exports.createBrand = Factory.createOne(Brand);
