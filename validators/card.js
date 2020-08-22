const { checkSchema, body } = require("express-validator");
const Settings = require("../models/settings");
const i18next = require("../i18next");

exports.cardValidator = [
  body("tok_id", i18next.t("cart:card_token_not_correct"))
    .trim()
    .isLength({ min: 20 })
    .custom((value) => value.startsWith("tok_")),
];
