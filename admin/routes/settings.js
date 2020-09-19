const express = require("express");
const router = express.Router();
const { getGenerals, updateGenerals } = require("../controllers/settings");
const multer = require("../helpers/multer");
const authorize = require("../middlewares/authorize");

router.use(authorize(["Owner", "Administrator"]));

// @route    GET
// @access   ADMIN
// @desc     Get General settings
router.get("/", getGenerals);

// @route    PUT
// @access   ADMIN
// @desc     Update General Settings
router.put("/", multer.single("logo"), updateGenerals);

module.exports = router;
