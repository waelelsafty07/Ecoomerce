const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddelware");

exports.createAddressValidator = [
  check("alias")
    .notEmpty()
    .withMessage("alias name must be required")
    .isLength({ min: 3 })
    .withMessage("alias name must be at least 3")
    .isLength({ max: 32 })
    .withMessage("alias name must be less than 32 characters"),
  check("details")
    .notEmpty()
    .withMessage("details  must be required")
    .isLength({ min: 3 })
    .withMessage("details  must be at least 3")
    .isLength({ max: 32 })
    .withMessage("details  must be less than 32 characters"),
  check("city")
    .notEmpty()
    .withMessage("City  must be required")
    .isLength({ min: 3 })
    .withMessage("City  must be at least 3")
    .isLength({ max: 32 })
    .withMessage("City  must be less than 32 characters"),
  check("postalCode")
    .notEmpty()
    .withMessage("Postal Code  must be required")
    .isLength({ min: 5, max: 5 })
    .withMessage("Postal Code  must be 6 digits"),
  check("phone")
    .notEmpty()
    .withMessage("details  must be required")
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid phone number only accepted Egy Phone numbers"),
  validatorMiddleware,
];

exports.deleteAddressValidator = [
  check("id").isMongoId().withMessage("Invalid Address ID Format"),
  validatorMiddleware,
];
