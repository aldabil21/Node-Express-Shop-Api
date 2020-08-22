const { validationResult } = require("express-validator");

class ErrorResponse extends Error {
  constructor(statusCode, message, data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }

  static validateRequest = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ErrorResponse(422, "Validation Error...", errors.array());
    }
  };
}

module.exports = ErrorResponse;
