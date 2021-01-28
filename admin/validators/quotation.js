const { checkSchema, query } = require("express-validator");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

const languageChecker = {
  options: (value) => i18next.options.supportedLngs.includes(value),
  errorMessage: (value) => `This language ${value} is not supported`,
};

exports.sheetSchema = checkSchema({
  id: {
    in: ["query"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  image: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  description: {
    isArray: {
      errorMessage: "Sheet description must be an array",
    },
  },
  "description.*.language": {
    in: ["body"],
    exists: {
      errorMessage: "Must specify the language of description",
    },
    custom: languageChecker,
  },
  "description.*.title": {
    in: ["body"],
    trim: true,
    isLength: {
      errorMessage: "Must be between 3 and 255 letter",
      options: { min: 3, max: 255 },
    },
  },
  status: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? 1 : 0),
    },
  },
  sort_order: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  properties: {
    in: ["body"],
    errorMessage: "Properties Must be an Array",
    isArray: true,
  },
  "properties.*.description": {
    in: ["body"],
    errorMessage: "Properties description must be an Array",
    isArray: true,
  },
  "properties.*.image": {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  "properties.*.weight": {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 100),
    },
  },
  "properties.*.ton_price": {
    in: ["body"],
    toFloat: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 1000),
    },
  },
  "properties.*.description.*.title": {
    in: ["body"],
    isLength: {
      errorMessage: "Must be between 3 and 16 letter",
      options: { min: 3, max: 16 },
    },
  },
  "properties.*.description.*.language": {
    in: ["body"],
    exists: {
      errorMessage: "Must specify the language of description",
    },
    custom: languageChecker,
  },
});
