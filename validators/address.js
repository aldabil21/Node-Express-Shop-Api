const { checkSchema, body } = require("express-validator");
const i18next = require("../i18next");

exports.addressSchema = checkSchema({
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
  country_code: {
    trim: true,
    isLength: {
      options: { min: 2, max: 4 },
    },
    errorMessage: i18next.t("common:invalid_mobile"),
  },
  mobile: {
    trim: true,
    isLength: {
      options: { min: 7, max: 10 },
    },
    isMobilePhone: true,
    errorMessage: i18next.t("common:invalid_mobile"),
  },
  line1: {
    in: ["body"],
    trim: true,
    isLength: {
      options: { min: 4, max: 100 },
      errorMessage: i18next.t("common:length_between", { min: 3, max: 100 }),
    },
  },
  country: {
    in: ["body"],
    trim: true,
    isLength: {
      options: { min: 2, max: 4 },
      errorMessage: i18next.t("common:length_between", { min: 2, max: 4 }),
    },
  },
  city: {
    in: ["body"],
    trim: true,
    isLength: {
      options: { min: 2, max: 10 },
      errorMessage: i18next.t("common:length_between", { min: 2, max: 10 }),
    },
  },
  state_code: {
    in: ["body"],
    trim: true,
    // isLength: {
    //   options: { min: 4, max: 8 },
    //   errorMessage: i18next.t("common:length_between", { min: 2, max: 8 }),
    // },
  },
  post_code: {
    in: ["body"],
    trim: true,
    // isLength: {
    //   options: { min: 4, max: 8 },
    //   errorMessage: i18next.t("common:length_between", { min: 2, max: 8 }),
    // },
  },
  lat: {
    in: ["body"],
    trim: true,
    toFloat: true,
    isLength: {
      options: { min: 2, max: 32 },
      errorMessage: i18next.t("common:length_between", { min: 2, max: 32 }),
    },
  },
  lng: {
    in: ["body"],
    trim: true,
    toFloat: true,
    isLength: {
      options: { min: 2, max: 32 },
      errorMessage: i18next.t("common:length_between", { min: 2, max: 32 }),
    },
  },
  is_primary: {
    toBoolean: true,
    customSanitizer: {
      options: (value) => (value ? 1 : 0),
    },
  },
});
