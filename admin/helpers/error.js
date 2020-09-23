const { validationResult } = require("express-validator");
const { i18next } = require("../../i18next");

class ErrorResponse extends Error {
  constructor(statusCode, message, data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }

  static validateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ErrorResponse(
        422,
        i18next.t("common:validation_error"),
        errors.array()
      );
    }
  }
}

module.exports = ErrorResponse;
