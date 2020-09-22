const Statistics = require("../models/statistics");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     Get Nubmers Statistics (total orders/need action/neglected carts, total sales, total customes, total discounts)
exports.getNumbers = async (req, res, next) => {
  try {
    const statistics = await Statistics.getNumbers();

    res.status(200).json({ success: true, data: statistics });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get Chart Statistics (Sales & order countries per year/month/week)
exports.getCharts = async (req, res, next) => {
  try {
    const { monthly, daily } = req.query;

    const statistics = await Statistics.getCharts(monthly, daily);

    res.status(200).json({ success: true, data: statistics });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get Rank Statistics (most viewed products, most ordered products)
exports.getRanks = async (req, res, next) => {
  try {
    const statistics = await Statistics.getRanks();
    res.status(200).json({ success: true, data: statistics });
  } catch (err) {
    next(err);
  }
};
