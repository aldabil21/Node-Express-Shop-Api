const errorHandler = (err, req, res, next) => {
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

module.exports = errorHandler;
