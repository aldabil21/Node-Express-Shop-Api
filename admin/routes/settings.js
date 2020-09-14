const express = require("express");
const router = express.Router();
const { getGenerals, updateGenerals } = require("../controllers/settings");
const multer = require("../helpers/multer");
const authorize = require("../middlewares/authorize");

router.use(authorize);

// @route    POST
// @access   ADMIN
// @desc     Get General settings
router.get("/", getGenerals);

// @route    POST
// @access   ADMIN
// @desc     Update General Settings
router.put("/", multer.single("logo"), updateGenerals);

module.exports = router;
