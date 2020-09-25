const rateLimit = require("express-rate-limit");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../i18next");

const rateLimiter = (req, res, next) => {
  // app.set("trust proxy", 1);
  return rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: () => {
      throw new ErrorResponse(
        429,
        i18next.t("common:exceeded_allowed_requests")
      );
    },
  });
};

module.exports = rateLimiter;
