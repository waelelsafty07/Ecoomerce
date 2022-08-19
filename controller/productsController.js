const asyncHandler = require("express-async-handler");

const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const Product = require("../model/productModel");
const Factory = require("./handlerFactory");

const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  { name: "images", maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  console.log(req.files);
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.webp`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(600, 600)
      .toFormat("webp")
      .webp({ quality: 85 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    req.body.imageCover = imageCoverFileName;
  }
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.webp`;
        await sharp(img.buffer)
          .resize(600, 600)
          .toFormat("webp")
          .webp({ quality: 85 })
          .toFile(`uploads/products/${imageName}`);

        req.body.images.push(imageName);
      })
    );
    next();
  }
  // next();
});

exports.filterobj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
/*  @desc   Get list of products
    @route  GET /api/v1/products
    @access Public  
*/
exports.getProducts = Factory.getAll(Product, "Products");
/*  @desc   Get specific product by id
    @route  GET /api/v1/products/:id
    @access Public  
*/
exports.getProduct = Factory.getOne(Product, "reviews", "Products");

/*  @desc   Update specific Product by id
    @route  PUT /api/v1/products/:id
    @access Private/admin or manager  
*/
exports.updateProduct = Factory.updateOne(Product);

/*  @desc   Update specific product by id
    @route  Delete /api/v1/products/:id
    @access Private/Manager  
*/
exports.deleteProduct = Factory.deleteOne(Product);

/*  @desc   Create a new brand
    @route  POST   /api/v1/brands
    @access Private/admin or manager  
*/
exports.createProduct = Factory.createOne(Product);
