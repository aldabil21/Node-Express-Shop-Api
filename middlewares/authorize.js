const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ErrorResponse = require("../helpers/error");
const i18next = require("../i18next");

const authorize = (roles = []) => async (req, res, next) => {
  try {
    let token;

    //Get token from header
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    //Try from cookie
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      //keep using guestId
      throw new ErrorResponse(401, i18next.t("common:invalid_credentials"));
    }
    //Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.uid);

    if (!user) {
      throw new ErrorResponse(401, i18next.t("common:invalid_credentials"));
    }

    if (!roles.includes(user.role)) {
      throw new ErrorResponse(401, i18next.t("common:not_authorized"));
    }
    req.user = user.user_id;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authorize;
