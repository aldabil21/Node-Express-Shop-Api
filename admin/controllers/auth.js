const Admin = require("../models/admin");
const Settings = require("../models/settings");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");
// const { resGuestIdCookie } = require("../middlewares/guestId");

//@route    POST
//@access   PUBLIC
//@desc     Sign in
exports.signin = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };

    ErrorResponse.validateRequest(req);

    const { token, role, username } = await Admin.signin(data);
    const locale = req.locale || i18next.language;
    const languages = AppLanguages.map((lang) => {
      return { language: lang.language, code: lang.code };
    });
    const siteName = Settings.getSetting("config", "site_name").site_name;
    const google_api = Settings.getSetting("config", "google_api").google_api;
    const settings = {
      languages: languages,
      siteName: siteName,
      google_api: google_api,
    };
    //clear guest cookie + add token cookie
    res.clearCookie("guest");
    res.cookie("token", token, tokenCookieOptions);

    res.status(200).json({
      success: true,
      data: { token, role, username, locale, settings },
    });
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
    const role = req.adminRole;
    const username = req.adminUsername;

    //return same token
    const token = req.headers.authorization.split(" ")[1];
    const locale = req.locale || i18next.language;
    const languages = AppLanguages.map((lang) => {
      return { language: lang.language, code: lang.code };
    });

    const siteName = Settings.getSetting("config", "site_name").site_name;
    const google_api = Settings.getSetting("config", "google_api").google_api;
    const settings = {
      languages: languages,
      siteName: siteName,
      google_api: google_api,
    };
    //clear guest cookie + add token cookie
    res.clearCookie("guest");
    res.cookie("token", token, tokenCookieOptions);
    res.status(200).json({
      success: true,
      data: { token, role, username, locale, settings },
    });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   PUBLIC
//@desc     Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    ErrorResponse.validateRequest(req);

    const exist = await Admin.findOne(email);

    if (exist) {
      await Admin.generateResetPasswordToken(exist, req);
    }

    res.status(200).json({
      success: true,
      data: "",
    });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   PUBLIC
//@desc     Validate forgot password
exports.validateForgotPassword = async (req, res, next) => {
  try {
    const { email, token } = req.params;

    const exist = await Admin.validateForgotPassword(email, token);

    if (!exist) {
      throw new ErrorResponse(422, i18next.t("common:reset_url_err_expired"));
    }

    res.status(200).json({
      success: true,
      data: "",
    });
  } catch (err) {
    next(err);
  }
};
//@route    POST
//@access   PUBLIC
//@desc     Validate forgot password
exports.resetForgotPassword = async (req, res, next) => {
  try {
    const { email, token } = req.params;
    const { password } = req.body;
    ErrorResponse.validateRequest(req);

    const exist = await Admin.validateForgotPassword(email, token);
    if (!exist) {
      throw new ErrorResponse(422, i18next.t("common:reset_url_err_expired"));
    }

    const resetted = await Admin.resetForgotPassword(exist, password);

    res.status(200).json({
      success: true,
      data: "",
    });
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
