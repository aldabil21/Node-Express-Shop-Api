const Admin = require("../models/admin");
const ErrorResponse = require("../helpers/error");
const i18next = require("../../i18next");
// const { resGuestIdCookie } = require("../middlewares/guestId");

//@route    POST
//@access   ADMIN
//@desc     Register new Admin
exports.register = async (req, res, next) => {
  try {
    const data = {
      ip: req.ip,
      ...req.body,
    };

    ErrorResponse.validateRequest(req);

    const admin = ""; //await Admin.register(data);
    res.status(201).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

// //@route    POST
// //@access   PUBLIC
// //@desc     Confirm OTP
// exports.confirmOTP = async (req, res, next) => {
//   try {
//     const data = {
//       ...req.body,
//     };

//     ErrorResponse.validateRequest(req);

//     const tokenInfo = await User.confirm(data);

//     //Silently Change cart guestId to userId
//     Cart.setUserIdAfterAuth(req.guest, user.user_id);

//     //clear guest cookie + add token cookie
//     res.clearCookie("guest");
//     res.cookie("token", tokenInfo.token, tokenCookieOptions);

//     res.status(200).json({ success: true, data: tokenInfo });
//   } catch (err) {
//     next(err);
//   }
// };

//@route    POST
//@access   PUBLIC
//@desc     Sign in
exports.signin = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };

    ErrorResponse.validateRequest(req);

    const token = await Admin.signin(data);
    //clear guest cookie + add token cookie
    res.clearCookie("guest");
    res.cookie("token", token, tokenCookieOptions);

    res
      .status(200)
      .json({ success: true, data: { token, locale: i18next.language } });
  } catch (err) {
    next(err);
  }
};

exports.signout = (req, res, next) => {
  res.clearCookie("token");
  // const guestId = resGuestIdCookie(res);
  res.status(200).json({ success: true, data: {} });
};

//@route    POST
//@access   ADMIN
//@desc     Init app - auto auth
exports.initApp = async (req, res, next) => {
  try {
    //return same token
    const token = req.headers.authorization.split(" ")[1];
    const locale = req.locale || i18next.language;

    //clear guest cookie + add token cookie
    res.clearCookie("guest");
    res.cookie("token", token, tokenCookieOptions);

    res.status(200).json({ success: true, data: { token, locale } });
  } catch (err) {
    next(err);
  }
};

//Helpers
const tokenCookieOptions = {
  expires: new Date(Date.now() + 24 * 2 * 60 * 60 * 1000), //2d
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
