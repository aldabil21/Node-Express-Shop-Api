const { checkSchema } = require("express-validator");
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

exports.CPValidator = checkSchema({
  coupon: {
    in: ["body"],
    trim: true,
    isLength: {
      errorMessage: i18next.t("cart:coupon_wrong_form"),
      options: { max: 20 },
    },
  },
  points: {
    in: ["body"],
    toInt: true,
    isLength: {
      errorMessage: i18next.t("cart:coupon_wrong_form"),
      options: { max: 20 },
    },
    customSanitizer: {
      options: (value) => value || 0,
    },
  },
});

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
