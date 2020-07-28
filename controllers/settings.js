const i18next = require("../i18next");

//@route    GET
//@access   PUBLIC
//@desc     CHANGE LANGUAGE
exports.changeLanguage = (req, res, next) => {
  //TODO: throw error if language is not supported
  const { language } = req.body;
  req.i18n.changeLanguage(language);
  reqLanguage = language;
  // i18next.changeLanguage(language);
  res.status(200).json({ sucess: true, currentLanguage: reqLanguage });
};
