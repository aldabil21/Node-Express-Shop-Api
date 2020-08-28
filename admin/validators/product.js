const {
  checkSchema,
  sanitizeQuery,
  check,
  query,
} = require("express-validator");
const i18next = require("../../i18next");

const languageChecker = {
  options: (value) => i18next.options.supportedLngs.includes(value),
  errorMessage: (value) => `This language ${value} is not supported`,
};

const quantityChecker = {
  in: ["body"],
  trim: true,
  toInt: true,
  errorMessage: "Must be a number greater than 0",
  isInt: {
    options: { gt: 0 },
  },
};

const priceChecker = {
  in: ["body"],
  isCurrency: {
    errorMessage: "Must be a valid price. eg: 99.99",
  },
  custom: {
    errorMessage: "Must be greater than 0",
    options: (value) => value > 0,
  },
};

exports.productSchema = checkSchema({
  quantity: quantityChecker,
  description: {
    isArray: {
      errorMessage: "Product description must be an array",
    },
  },
  "description.*.language": {
    in: ["body"],
    exists: {
      errorMessage: "Must specify the language of product description",
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
  "description.*.description": {
    in: ["body"],
    notEmpty: {
      errorMessage: "Please enter a description",
    },
  },
  price: priceChecker,
  points: {
    in: ["body"],
    errorMessage: "Must be a number",
    toInt: true,
  },
  tax_id: {
    in: ["body"],
    toInt: true,
    notEmpty: {
      errorMessage: "Must choose a tax type",
    },
  },
  weight: {
    in: ["body"],
    toInt: true,
    notEmpty: {
      errorMessage: "Must choose a tax type",
    },
  },
  subtract: {
    in: ["body"],
    toInt: true,
    notEmpty: {
      errorMessage: "Must choose a subtract type",
    },
  },
  minimum: {
    in: ["body"],
    toInt: true,
    errorMessage: "Must be a number greater than 0",
    isInt: {
      options: { gt: 0 },
    },
  },
  maximum: {
    in: ["body"],
    toInt: true,
    errorMessage: "Must be a number",
    customSanitizer: {
      options: (value) => (!parseInt(value) ? null : value),
    },
  },
  available_at: {
    in: ["body"],
    toDate: true,
    isISO8601: {
      errorMessage: "Must be a valid date",
    },
  },
  status: {
    in: ["body"],
    toInt: true,
    isInt: true,
    errorMessage: "Must be a number",
  },
  options: {
    in: ["body"],
    errorMessage: "Options Must be an Array",
    isArray: true,
  },
  "options.*.quantity": quantityChecker,
  "options.*.price": priceChecker,
  "options.*.description": {
    in: ["body"],
    errorMessage: "Options description must be an Array",
    isArray: true,
  },
  "options.*.description.*.language": {
    in: ["body"],
    exists: {
      errorMessage: "Must specify the language of option description",
    },
    custom: languageChecker,
  },
  category: {
    in: ["body"],
    errorMessage: "Categories must be an Array",
    isArray: true,
  },
  filter: {
    in: ["body"],
    errorMessage: "Filters must be an Array",
    isArray: true,
  },
  attribute: {
    in: ["body"],
    errorMessage: "Attributes must be an Array",
    isArray: true,
  },
  "attribute.*.attribute_id": {
    in: ["body"],
    toInt: true,
    notEmpty: {
      errorMessage: "Must choose a subtract type",
    },
  },
  "attribute.*.description": {
    in: ["body"],
    errorMessage: "Attribute description must be an Array",
    isArray: true,
  },
  "attribute.*.description.*.language": {
    in: ["body"],
    exists: {
      errorMessage: "Must specify the language of attribute description",
    },
    custom: languageChecker,
  },
  wholesales: {
    in: ["body"],
    errorMessage: "Wholesale prices must be an Array",
    isArray: true,
  },
  "wholesales.*.quantity": quantityChecker,
  "wholesales.*.price": priceChecker,
});

exports.queryVal = [
  query("special").toBoolean(),
  query("page").toInt(),
  query("perPage").toInt(),
  query("direction").customSanitizer((value) =>
    value === "asc" || value === "desc" ? value : "asc"
  ),
];
