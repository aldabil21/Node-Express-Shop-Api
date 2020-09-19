const { checkSchema, body } = require("express-validator");
const { i18next } = require("../../i18next");

exports.adminSchema = checkSchema({
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
  role: {
    trim: true,
    exists: true,
    custom: {
      options: (value) => {
        if (
          value === "Administrator" ||
          value === "Manager" ||
          value === "Seller"
        ) {
          return true;
        }
        return false;
      },
    },
    errorMessage: i18next.t("settings:wrong_role"),
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
