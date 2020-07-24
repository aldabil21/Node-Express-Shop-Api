const i18next = require("../i18next");

//@route    GET
//@access   PUBLIC
//@desc     CHANGE LANGUAGE
exports.changeLanguage = (req, res, next) => {
  const { language } = req.body;
  // req.i18n.changeLanguage(language);
  i18next.changeLanguage(language);
  res.status(200).json({ sucess: true, currentLanguage: language });
};
