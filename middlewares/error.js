const ErrorResponse = require("../helpers/error");
const { i18next } = require("../i18next");

exports.errorHandler = (err, req, res, next) => {
  // console.log(err);
  let status = err.statusCode || 500;
  let message = err.message || i18next.t("common:somthing_went_wrong");
  let data = err.data || {};

  //Token invalid error
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = i18next.t("common:fail_to_authenticate");
  }

  //Axios || Tap errors
  if (err.response && err.response.data) {
    status = 400;
    data = err.response.data;
  }

  //Multer limit err
  if (err.name === "MulterError" && err.message === "File too large") {
    message = i18next.t("common:multer_file_large");
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
  // const error = new ErrorResponse(404, "URL Not Found...");
  // next(error);
  res.redirect("https://express-shop.netlify.app/");
};
