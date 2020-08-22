const i18next = require("../i18next");
const ErrorResponse = require("../helpers/error");

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
