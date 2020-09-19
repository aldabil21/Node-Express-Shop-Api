const express = require("express");
const router = express.Router();
const {
  getShipSettings,
  updateShipSettings,
} = require("../controllers/shipping");
const authorize = require("../middlewares/authorize");

router.use(authorize(["Owner", "Administrator", "Manager"]));

// @route    GET
// @access   ADMIN
// @desc     Get Shipping settings
router.get("/", getShipSettings);

// @route    PUT
// @access   ADMIN
// @desc     Update Shipping Settings
router.put("/", updateShipSettings);

module.exports = router;
