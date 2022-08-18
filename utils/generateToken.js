const jwt = require("jsonwebtoken");

const generateToken = (payload, ExpireTime, res) => {
  const token = jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: ExpireTime,
  });

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return token;
};
module.exports = generateToken;
