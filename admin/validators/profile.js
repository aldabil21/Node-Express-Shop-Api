const { checkSchema, body } = require("express-validator");
const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");

exports.profileSchema = checkSchema({
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
});

exports.passUpdate = [
  body(
    "oldpassword",
    i18next.t("common:length_between", { min: 6, max: 20 })
  ).isLength({ min: 6, max: 20 }),
  body("password")
    .isLength({ min: 6, max: 20 })
    .withMessage(i18next.t("common:length_between", { min: 6, max: 20 }))
    .custom((value, { req }) => {
      if (value === req.body.oldpassword) {
        return false;
      }
      return true;
    })
    .withMessage(i18next.t("common:pass_cannot_same")),
];
