const multer = require("multer");
const APIError = require("../utils/APIError");

const multerOptions = () => {
  const storage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else cb(new APIError("Only Images allowed", 400), false);
  };
  const upload = multer({ storage: storage, fileFilter: multerFilter });
  return upload;
};
exports.uploadSingleImage = (image) => multerOptions().single(image);
exports.uploadMixOfImages = (arrayOfImages) =>
  multerOptions().fields(arrayOfImages);
