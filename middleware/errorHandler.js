const ErrorHand = require("../util/errorHand");

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  if (err.code === 11000) {
    const message = `already exist`;
    error = new ErrorHand(message, 401);
  }
  if (err.name === "ValidationError") {
    const message = `invalid data entered`;
    error = new ErrorHand(message, 401);
  }
  if (err.name === "JsonWebTokenError") {
    const message = `invalid token`;
    error = new ErrorHand(message, 401);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message });
  next();
};
