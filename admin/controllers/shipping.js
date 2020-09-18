const Shipping = require("../models/shipping");
const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");

// @route    GET
// @access   ADMIN
// @desc     Get Shipping settings
exports.getShipSettings = async (req, res, next) => {
  try {
    const settings = await Shipping.getSettings();

    res.status(200).json({ sucess: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// @route    PUT
// @access   ADMIN
// @desc     Update Shipping Settings
exports.updateShipSettings = async (req, res, next) => {
  try {
    const data = req.body;

    let _settings = [];
    for (const key in data) {
      //Reservse status value - (if 1, means want site-wide free shipping, then make shipping status = 0)
      if (key === "status") {
        const value = {
          ...data[key],
          value: data[key].value > 0 ? 0 : 1,
        };
        _settings.push(value);
      } else {
        _settings.push(data[key]);
      }
    }

    const settings = await Shipping.updateSettings(_settings);

    res.status(200).json({ sucess: true, data: settings });
  } catch (err) {
    next(err);
  }
};
