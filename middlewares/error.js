const ErrorResponse = require("../helpers/error");

exports.errorHandler = (err, req, res, next) => {
  //   console.log(err);
  let status = err.statusCode || 500;
  let message = err.message || "Somthing went wrong";
  let data = err.data || {};

  //Axios || Tap errors
  if (err.response && err.response.data) {
    status = 400;
    data = err.response.data;
  }

  const error = {
    success: false,
    statusCode: status,
    message: message,
    data: data,
  };
  // console.log(error);
  res.status(status).json(error);
};

exports.error404 = (req, res, next) => {
  const error = new ErrorResponse(404, "URL Not Found...");
  next(error);
};
