const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const ErrorResponse = require("../helpers/error");
const i18next = require("../../i18next");

const authorize = async (req, res, next) => {
  try {
    let token;

    //Get token from header
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    //Try from cookie
    if (!token && req.cookies && req.cookies.user) {
      const cookie = JSON.parse(req.cookies.user);
      token = cookie.token;
    }
    // console.log(req.headers);
    if (!token) {
      //keep using guestId
      throw new ErrorResponse(401, i18next.t("common:invalid_credentials"));
    }
    //Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByKid(decoded.kid);

    if (!admin) {
      throw new ErrorResponse(401, i18next.t("common:invalid_credentials"));
    }

    req.admin = admin.admin_id;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authorize;
