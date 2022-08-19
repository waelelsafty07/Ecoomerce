const multer = require("multer");
const APIError = require("../utils/APIError");

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    cb(null, true);
  else
    cb(
      new APIError("Invalid file type, only excel file is allowed", 400),
      false
    );
};

const upload = multer({
  fileFilter: multerFilter,
});

exports.uploadExcelFile = upload.single("excel");
