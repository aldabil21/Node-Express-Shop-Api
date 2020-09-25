const config = (req, res, next) => {
  global.serverHost = req.protocol + "://" + req.get("host");
  global.staticHost = req.protocol + "://" + req.get("host") + "/api";
  global.adminHost = req.protocol + "://" + req.get("host") + "/admin";
  next();
};

module.exports = config;
