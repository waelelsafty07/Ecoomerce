const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const nodeXlsx = require("node-xlsx");

const Product = require("../model/productModel");
const Factory = require("./handlerFactory");

const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const { uploadExcelFile } = require("../middlewares/uploadExcelFileMiddleware");
const { sendSuccess } = require("../utils/sendResponse");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  { name: "images", maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
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

exports.uploadExcelFile = uploadExcelFile;

exports.storeExcelFile = asyncHandler(async (req, res, next) => {
  const sheet = nodeXlsx.parse(req.file.buffer)[0].data;
  const keys = sheet[0];
  const values = sheet.slice(1);

  const products = [];
  for (let j = 0; j < values.length; j += 1) {
    products[j] = {};
    for (let i = 0; i < keys.length; i += 1) {
      if (
        keys[i] === "tags" ||
        keys[i] === "images" ||
        keys[i] === "colors" ||
        keys[i] === "subcategories" ||
        keys[i] === "sizes"
      )
        values[j][i] = values[j][i].toString().split(",");
      products[j][keys[i]] = values[j][i];
    }
  }
  products.forEach(async (product) => {
    await Product(product).save({ validateBeforeSave: false });
  });
  sendSuccess(products, 201, res, {
    message: "Products created from excel sheet successfully",
  });
});
