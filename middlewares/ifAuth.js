const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { resGuestIdCookie } = require("./guestId");

/**
 *  This is to check if user is logged, then use the token's userID
 *  else stick with the guestID. with no errors throws
 *  endpints with this "ifAuth" is not protected, just used to pick the right id
 */

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
      // if(!req.guest){
      //   const guestId = resGuestIdCookie(res);
      //   req.guest = guestId;
      // }
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByKid(decoded.kid);

    if (user) {
      req.user = user.user_id;
    }

    next();
  } catch (err) {
    next();
  }
};

module.exports = ifAuth;
