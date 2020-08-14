const { checkSchema, body } = require("express-validator");
const Settings = require("../models/settings");
const Address = require("../models/address");
const i18next = require("../i18next");
const ErrorResponse = require("../helpers/error");

const paymentIsAvailable = (code) => {
  const payment = Settings.getSetting("payment_method", code);
  if (payment[code] !== "1") {
    return false;
  }
  return true;
};

exports.couponValidator = [
  body("coupon", i18next.t("cart:coupon_wrong_form"))
    .trim()
    .isLength({ max: 20 }),
];
exports.pointsValidator = [
  body("points", i18next.t("cart:points_wrong_form"))
    .trim()
    .isLength({ max: 20 })
    .toInt()
    .customSanitizer((value) => (value && +value > 0 ? value : 0)),
];

exports.checkoutValidator = checkSchema({
  address_id: {
    in: ["body"],
    toInt: true,
    custom: {
      options: async (value, { req }) => {
        const user_id = req.user;
        const address = await Address.getAddress(value, user_id);
        if (!address) {
          throw new ErrorResponse(422, i18next.t("cart:address_not_found"));
        }
        return true;
      },
    },
  },
  payment_method: {
    in: ["body"],
    trim: true,
    custom: {
      errorMessage: i18next.t("cart:payment_method_not_exist"),
      options: (value) => paymentIsAvailable(value),
    },
  },
});
