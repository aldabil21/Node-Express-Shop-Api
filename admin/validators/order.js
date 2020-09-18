const { param, body, query } = require("express-validator");
const { i18next } = require("../../i18next");
const Orders = require("../models/orders");
const ErrorResponse = require("../helpers/error");

exports.queryValidator = [
  query("order_status").trim(),
  query("payment_method").trim(),
];
exports.historyValidator = [
  param("id").toInt(),
  body("status_id")
    .toInt()
    .custom(async (value) => {
      const status = await Orders.isValidStatus(value);
      if (!status) {
        throw new ErrorResponse(
          422,
          i18next.t("orders:status_id_invalid", { id: value })
        );
      }
    }),
];
