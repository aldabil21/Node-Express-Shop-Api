const { checkSchema } = require("express-validator");
const Product = require("../models/product");
const ErrorResponse = require("../helpers/error");
const i18next = require("../../i18next");

exports.specialSchema = checkSchema({
  product_id: {
    in: ["params"],
    exists: true,
    toInt: true,
  },
  id: {
    in: ["params"],
    toInt: true,
  },
  price: {
    in: ["body"],
    isCurrency: {
      errorMessage: "Must be a valid price. eg: 99.99",
      options: {
        digits_after_decimal: [1, 2],
      },
    },
    custom: {
      options: async (value, { req }) => {
        if (value <= 0) {
          throw new ErrorResponse(422, "Must be greater than 0");
        }
        const product = await Product.findOne(req.params.product_id);
        if (product && parseFloat(product.price) <= value) {
          throw new ErrorResponse(
            422,
            i18next.t("product:special_gt_price", {
              special: value,
              price: product.price,
            })
          );
        }
        return true;
      },
    },
  },
  deadline: {
    in: ["body"],
    toDate: true,
    isISO8601: {
      errorMessage: "Must be a valid date",
    },
  },
  status: {
    in: ["body"],
    toInt: true,
    isInt: true,
    errorMessage: "Must be a number",
  },
});
