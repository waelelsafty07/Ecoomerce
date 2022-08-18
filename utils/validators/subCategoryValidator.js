const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getsubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID Format"),
  validatorMiddleware,
];

exports.createsubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name must be required")
    .isLength({ min: 3 })
    .withMessage("SubCategory name must be at least 3")
    .isLength({ max: 32 })
    .withMessage("SubCategory name must be less than 32 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("Category name must be required")
    .isMongoId()
    .withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];

exports.UpdatesubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID Format"),
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];
exports.deletesubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID Format"),
  validatorMiddleware,
];
