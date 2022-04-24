const jwt = require("jsonwebtoken");

const generateToken = (payload, ExpireTime) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: ExpireTime,
  });
module.exports = generateToken;
