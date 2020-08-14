const i18next = require("../i18next");

const languegeSetter = (req, res, next) => {
  // const haveReqLang = req.headers["content-language"];
  // const isIncluded = i18next.options.supportedLngs.includes(req.locale);
  // if (haveReqLang && isIncluded) {
  //   req.i18n.changeLanguage(req.headers["content-language"]);
  // }

  const detectedLng = req.locale;
  res.cookie("locale", detectedLng, {
    expires: new Date(Date.now() + 24 * 30 * 12 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  global.reqLanguage = detectedLng;
  i18next.changeLanguage(reqLanguage);
  next();
};

module.exports = languegeSetter;
