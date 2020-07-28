const i18next = require("../i18next");

const languegeSetter = (req, res, next) => {
  const haveReqLang = req.headers["content-language"];
  const isIncluded = i18next.options.supportedLngs.includes(haveReqLang);

  if (haveReqLang && isIncluded) {
    req.i18n.changeLanguage(req.headers["content-language"]);
  }
  global.reqLanguage = req.language;
  next();
};

module.exports = languegeSetter;
