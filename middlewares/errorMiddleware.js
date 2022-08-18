const APIError = require("../utils/APIError");

const handleJWTInvalidSignature = () =>
  new APIError("Invalid Token, Please login again.", 401);
const handleTokenExpiredError = () =>
  new APIError("Expired Token, Please login again.", 401);
const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
const sendErrorProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJWTInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleTokenExpiredError();
    sendErrorProd(err, res);
  }
};
module.exports = globalError;
