const { body, query } = require("express-validator");
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

exports.getSanitizer = [
  query("q").customSanitizer((value) => value || ""),
  query("page").customSanitizer((value) => (value > 0 ? value : 1)),
  query("perPage").customSanitizer((value) => (value > 0 ? value : 20)),
  query("sort").customSanitizer((value) => value || "date_added"),
  query("direction").customSanitizer((value) => value || "ASC"),
];
