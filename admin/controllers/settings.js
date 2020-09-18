const Settings = require("../models/settings");
const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");

// @route    GET
// @access   ADMIN
// @desc     Get General settings
exports.getGenerals = async (req, res, next) => {
  try {
    const settings = await Settings.getGenerals();

    res.status(200).json({ sucess: true, data: settings });
  } catch (err) {
    next(err);
  }
};
// @route    PUT
// @access   ADMIN
// @desc     Update General Settings
exports.updateGenerals = async (req, res, next) => {
  try {
    const data = req.body;
    delete data.logo;

    //set image to prev if did not upload image
    let image = data.prevImg ? JSON.parse(data.prevImg) : "";
    if (req.file) {
      //otherwise set it to new uploaded one
      image = req.file.path;
    }
    delete data.prevImg;

    let _settings = [];
    for (const key in data) {
      if (key === "site_logo") {
        const logoSetting = JSON.parse(data[key]);
        logoSetting.value = image;
        _settings.push(logoSetting);
      } else {
        _settings.push(JSON.parse(data[key]));
      }
    }

    const settings = await Settings.updateGenerals(_settings);

    res.status(200).json({ sucess: true, data: settings });
  } catch (err) {
    next(err);
  }
};
//@route    GET
//@access   ADMIN
//@desc     CHANGE LANGUAGE
exports.changeLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;

    const supported = i18next.options.supportedLngs.includes(language);

    if (!supported) {
      throw new ErrorResponse(422, `Languege ${language} not supported`);
    }

    res.cookie("locale", language, {
      expires: new Date(Date.now() + 24 * 30 * 12 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ sucess: true, currentLanguage: language });
  } catch (err) {
    next(err);
  }
};
