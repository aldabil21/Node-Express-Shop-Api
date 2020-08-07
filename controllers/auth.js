const User = require("../models/user");
const Cart = require("../models/cart");
const ErrorResponse = require("../helpers/error");
const { resGuestIdCookie } = require("../middlewares/guestId");

//@route    POST
//@access   PUBLIC
//@desc     Sign up new user
exports.signup = async (req, res, next) => {
  try {
    const data = {
      ip: req.ip,
      ...req.body,
    };

    ErrorResponse.validateRequest(req);

    const cart = await User.register(data);
    res.status(201).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   PUBLIC
//@desc     Confirm OTP
exports.confirmOTP = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };

    ErrorResponse.validateRequest(req);

    const tokenInfo = await User.confirm(data);

    //Silently Change cart guestId to userId
    Cart.setUserIdAfterAuth(req.guest, user.user_id);

    //clear guest cookie + add token cookie
    res.clearCookie("guest");
    res.cookie("token", tokenInfo.token, tokenCookieOptions);

    res.status(200).json({ success: true, data: tokenInfo });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   PUBLIC
//@desc     Sign in
exports.signin = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };

    ErrorResponse.validateRequest(req);

    const user = await User.signin(data);

    //Silently Change cart guestId to userId
    Cart.setUserIdAfterAuth(req.guest, user.user_id);

    //clear guest cookie + add token cookie
    res.clearCookie("guest");
    res.cookie("token", user.token, tokenCookieOptions);

    res.status(200).json({ success: true, data: user.token });
  } catch (err) {
    next(err);
  }
};

exports.signout = (req, res, next) => {
  res.clearCookie("token");
  const guestId = resGuestIdCookie(res);
  res.status(200).json({ success: true, data: {} });
};

//Helpers
const tokenCookieOptions = {
  expires: new Date(Date.now() + 24 * 2 * 60 * 60 * 1000), //2d
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
