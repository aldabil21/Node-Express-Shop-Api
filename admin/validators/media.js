const { body, query, checkSchema } = require("express-validator");
const { i18next } = require("../../i18next");

const languageChecker = {
  options: (value) => i18next.options.supportedLngs.includes(value),
  errorMessage: (value) => `This language ${value} is not supported`,
};

const returnCleanArray = (string) => {
  const _path = string || "";
  const __path = _path.replace(/ /g, "");
  return __path.split(",").filter((v) => v);
};

exports.pathQuery = [query("path").customSanitizer(returnCleanArray)];
exports.validDirname = [
  body("dirname")
    .customSanitizer((value) => value.replace(/ /g, ""))
    .isAlphanumeric("en-GB")
    .withMessage(i18next.t("filesystem:only_english")),
];
exports.validFile = [
  body("title").notEmpty().withMessage(i18next.t("filesystem:cannot_empty")),
];
exports.validDelete = [
  body("dirnames").customSanitizer(returnCleanArray),
  body("files").customSanitizer(returnCleanArray),
];
exports.galleryValidator = checkSchema({
  id: {
    in: ["params"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : ""),
    },
  },
  description: {
    isArray: {
      errorMessage: "Description must be an array",
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
  status: {
    in: ["body"],
    toInt: true,
    isInt: true,
    errorMessage: "Must be a number",
  },
});
