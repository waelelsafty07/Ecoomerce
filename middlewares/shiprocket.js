const Redis = require("../utils/redis");

exports.token = async (req, res, next) => {
  req.shipRocket = await new Redis().get("token");
  next();
};
