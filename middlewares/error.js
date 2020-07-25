const ErrorResponse = require("../helpers/error");

exports.errorHandler = (err, req, res, next) => {
  //   console.log(err);
  const status = err.statusCode || 500;
  const message = err.message || "Somthing went wrong";
  const data = err.data || {};

  res.status(status).json({
    success: false,
    statusCode: status,
    message: message,
    data: data,
  });
};

exports.error404 = (req, res, next) => {
  const error = new ErrorResponse(404, "URL Not Found...");
  next(error);
};
