const { checkSchema, query } = require("express-validator");
const { i18next } = require("../../i18next");
const Product = require("../models/product");
const Taxonomy = require("../models/taxonomy");
const ErrorResponse = require("../helpers/error");

const priceChecker = {
  in: ["body"],
  isCurrency: {
    errorMessage: "Must be a valid price. eg: 99.99",
  },
  custom: {
    errorMessage: "Must be greater than 0",
    options: (value) => value > 0,
  },
};

exports.couponSchema = checkSchema({
  id: {
    in: ["params"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : ""),
    },
  },
  title: {
    in: ["body"],
    trim: true,
    notEmpty: {
      errorMessage: "Please enter a title",
    },
    isLength: {
      errorMessage: "Must be between 4 and 100 letter",
      options: { min: 4, max: 100 },
    },
  },
  code: {
    in: ["body"],
    trim: true,
    notEmpty: {
      errorMessage: "Please enter a code",
    },
    isLength: {
      errorMessage: "Must be between 3 and 10 letter",
      options: { min: 3, max: 10 },
    },
  },
  type: {
    in: ["body"],
    trim: true,
    notEmpty: {
      errorMessage: "Please select a type",
    },
    isIn: {
      errorMessage: "Not a coupon type",
      options: [["P", "F"]],
    },
  },
  amount: priceChecker,
  min_total: {
    in: ["body"],
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
    isCurrency: {
      errorMessage: "Must be a valid price. eg: 99.99",
    },
  },
  date_start: {
    in: ["body"],
    toDate: true,
    isISO8601: {
      errorMessage: "Must be a valid date",
    },
  },
  date_end: {
    in: ["body"],
    toDate: true,
    isISO8601: {
      errorMessage: "Must be a valid date",
    },
  },
  total_limit: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  user_limit: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  status: {
    in: ["body"],
    toInt: true,
    customSanitizer: {
      options: (value) => (value > 0 ? value : 0),
    },
  },
  products: {
    isArray: {
      errorMessage: "products must be an array",
    },
  },
  "products.*": {
    in: ["body"],
    toInt: true,
    custom: {
      options: async (value) => {
        const product = await Product.findOne(value);
        if (!product) {
          throw new ErrorResponse(422, `Product ${value} not exist`);
        }
        return true;
      },
    },
  },
  categories: {
    isArray: {
      errorMessage: "categories must be an array",
    },
  },
  "categories.*": {
    in: ["body"],
    toInt: true,
    custom: {
      options: async (value) => {
        const cat = await Taxonomy.getTaxonomy(value, false);
        if (!cat) {
          throw new ErrorResponse(422, `Category ${value} not exist`);
        }
      },
    },
  },
});
exports.getSanitizer = [
  query("q").customSanitizer((value) => value || ""),
  query("page").customSanitizer((value) => (value > 0 ? value : 1)),
  query("perPage").customSanitizer((value) => (value > 0 ? value : 20)),
  query("sort").customSanitizer((value) => value || "date_added"),
  query("direction").customSanitizer((value) => value || "ASC"),
];
