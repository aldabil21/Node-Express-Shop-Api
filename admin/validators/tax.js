const { checkSchema } = require("express-validator");
const i18next = require("../../i18next");

exports.taxSchema = checkSchema({
  id: {
    in: ["params"],
    toInt: true,
  },
  value: {
    in: ["body"],
    isCurrency: {
      errorMessage: "Must be a valid price. eg: 99.99",
      options: {
        digits_after_decimal: [1, 2],
      },
    },
  },
  title: {
    in: ["body"],
    isLength: {
      options: { min: 3, max: 25 },
    },
    errorMessage: "Must be between 3 and 25 letters",
  },
  status: {
    in: ["body"],
    toInt: true,
    isInt: true,
    errorMessage: "Must be a number",
  },
});
