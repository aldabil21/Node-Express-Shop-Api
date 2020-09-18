const { checkSchema } = require("express-validator");
const Languages = require("../models/languages");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

exports.languageSchema = checkSchema({
  id: {
    in: ["params"],
    toInt: true,
  },
  language: {
    in: ["body"],
    isLength: {
      options: { min: 3, max: 10 },
      errorMessage: "Must be between 3 and 10 letters",
    },
  },
  code: {
    in: ["body"],
    isLocale: true,
    errorMessage: i18next.t("settings:language_code_err"),
    custom: {
      options: async (value, { req }) => {
        //When add new
        if (!req.params.id) {
          const lang = await Languages.getByCode(value);
          if (lang.length) {
            throw new ErrorResponse(
              422,
              i18next.t("settings:language_exists", { code: value })
            );
          }
        }
      },
    },
  },
  status: {
    in: ["body"],
    toInt: true,
    isInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
});
