const { checkSchema, body } = require("express-validator");
const { i18next } = require("../i18next");

exports.userSchema = checkSchema({
  id: {
    in: ["params"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : ""),
    },
  },
  firstname: {
    in: ["body"],
    trim: true,
    isLength: {
      options: { min: 3, max: 10 },
      errorMessage: i18next.t("common:length_between", { min: 3, max: 10 }),
    },
  },
  lastname: {
    in: ["body"],
    trim: true,
    isLength: {
      options: { min: 3, max: 10 },
      errorMessage: i18next.t("common:length_between", { min: 3, max: 10 }),
    },
  },
  email: {
    in: ["body"],
    normalizeEmail: {
      options: {
        gmail_remove_dots: false,
      },
    },
    isEmail: {
      errorMessage: i18next.t("common:invalid_email"),
    },
  },
  country_code: {
    trim: true,
    notEmpty: true,
    isLength: {
      options: { min: 2, max: 3 },
    },
    errorMessage: i18next.t("common:length_between", { min: 2, max: 4 }),
  },
  mobile: {
    trim: true,
    isMobilePhone: true,
    errorMessage: i18next.t("common:invalid_mobile"),
  },
  password: {
    isLength: {
      options: { min: 6, max: 12 },
      errorMessage: i18next.t("common:length_between", { min: 6, max: 12 }),
    },
  },
  newsletter: {
    toBoolean: true,
    customSanitizer: {
      options: (value) => (value ? 1 : 0),
    },
  },
});

exports.isOTP = [
  body("mobile", i18next.t("common:invalid_mobile")).isMobilePhone(),
  body("email", i18next.t("common:invalid_email"))
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail(),
  body("otp", i18next.t("common:invalid_otp"))
    .toInt()
    .isLength({ min: 4, max: 4 }),
];
exports.isSignin = [
  body("email", i18next.t("common:invalid_email"))
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail(),
];
