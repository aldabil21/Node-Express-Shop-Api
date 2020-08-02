const jwt = require("jsonwebtoken");
const User = require("../models/user");

const ifAuth = async (req, res, next) => {
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
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.uid);

    if (user) {
      req.user = user.user_id;
    }

    next();
  } catch (err) {
    next();
  }
};

module.exports = ifAuth;
