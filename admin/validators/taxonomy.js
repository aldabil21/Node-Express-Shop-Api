const { checkSchema, query } = require("express-validator");
const { i18next } = require("../../i18next");

const languageChecker = {
  options: (value) => i18next.options.supportedLngs.includes(value),
  errorMessage: (value) => `This language ${value} is not supported`,
};

const types = [
  "product_category",
  "product_tag",
  "product_filter",
  "media_category",
  "media_tag",
];

exports.getValidate = [
  query("type", i18next.t("taxonomy:type_err")).custom((value) =>
    types.includes(value)
  ),
  query("q").customSanitizer((value) => value || ""),
  query("page").customSanitizer((value) => (value > 0 ? value : 1)),
  query("perPage").customSanitizer((value) => (value > 0 ? value : 20)),
  query("sort_order").customSanitizer((value) => value || "sort_order"),
  query("direction").customSanitizer((value) => value || "ASC"),
  query("expand").customSanitizer((value) =>
    value === "children" ? value : ""
  ),
];

exports.taxonomySchema = checkSchema({
  id: {
    in: ["params"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : ""),
    },
  },
  description: {
    isArray: {
      errorMessage: "Taxonomy description must be an array",
    },
  },
  "description.*.language": {
    in: ["body"],
    exists: {
      errorMessage: "Must specify the language of the description",
    },
    custom: languageChecker,
  },
  "description.*.title": {
    in: ["body"],
    trim: true,
    notEmpty: {
      errorMessage: "Please enter a title",
    },
    isLength: {
      errorMessage: "Must be between 3 and 255 letter",
      options: { min: 3, max: 255 },
    },
  },
  //TODO: When doing web, make required
  //   "description.*.description": {
  //     in: ["body"],
  //     notEmpty: {
  //       errorMessage: "Please enter a description",
  //     },
  //     isLength: {
  //       errorMessage: "Must be between 3 and 255 letter",
  //       options: { min: 3, max: 255 },
  //     },
  //   },
  //   "description.*.meta_title": {
  //     in: ["body"],
  //     notEmpty: {
  //       errorMessage: "Please enter a meta title",
  //     },
  //     isLength: {
  //       errorMessage: "Must be between 5 and 100 letter",
  //       options: { min: 5, max: 100 },
  //     },
  //   },
  //   "description.*.meta_description": {
  //     in: ["body"],
  //     notEmpty: {
  //       errorMessage: "Please enter a meta description",
  //     },
  //     isLength: {
  //       errorMessage: "Must be between 5 and 255 letter",
  //       options: { min: 5, max: 255 },
  //     },
  //   },
  //   "description.*.meta_keyword": {
  //     in: ["body"],
  //     notEmpty: {
  //       errorMessage: "Please enter a meta keywords",
  //     },
  //     isLength: {
  //       errorMessage: "Must be between 5 and 255 letter",
  //       options: { min: 5, max: 255 },
  //     },
  //   },
  type: {
    in: ["body"],
    errorMessage: i18next.t("taxonomy:type_err"),
    custom: {
      options: (value) => types.includes(value),
    },
  },
  image: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  parent_id: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  sort_order: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  status: {
    in: ["body"],
    toInt: true,
    isInt: true,
    errorMessage: "Must be a number",
  },
});
