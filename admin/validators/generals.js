const { body } = require("express-validator");
const { i18next } = require("../../i18next");

exports.isEmail = [
  body("email", i18next.t("common:invalid_email"))
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail(),
];

exports.isPassword = [
  body(
    "password",
    i18next.t("common:length_between", { min: 6, max: 20 })
  ).isLength({ min: 6, max: 20 }),
];
