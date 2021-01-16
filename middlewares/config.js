const path = require("path");
const config = (req, res, next) => {
  global.serverHost = req.protocol + "://" + req.get("host");
  global.staticHost = req.protocol + "://" + req.get("host") + "/api";
  global.adminHost = req.protocol + "://" + req.get("host") + "/admin";
  global.__rootpath = path.join(__dirname, "..");
  next();
};

module.exports = config;
