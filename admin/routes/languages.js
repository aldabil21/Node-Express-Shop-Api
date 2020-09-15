const express = require("express");
const router = express.Router();
const {
  getLanguages,
  getLanguage,
  updateLanguage,
  addLanguage,
  deleteLanguage,
  switchStatus,
} = require("../controllers/languages");
const authorize = require("../middlewares/authorize");
const { languageSchema } = require("../validators/languages");

router.use(authorize);

// @route    GET
// @access   ADMIN
// @desc     Get languages
router.get("/", getLanguages);

// @route    GET
// @access   ADMIN
// @desc     Get language by ID
router.get("/:id", getLanguage);

// @route    POST
// @access   ADMIN
// @desc     Add language
router.post("/", languageSchema, addLanguage);

// @route    PUT
// @access   ADMIN
// @desc     Update Language
router.put("/:id", languageSchema, updateLanguage);

// @route    PUT
// @access   ADMIN
// @desc     Update Language
router.patch("/:id", switchStatus);

// @route    DELETE
// @access   ADMIN
// @desc     Delete Language
router.delete("/:id", deleteLanguage);

module.exports = router;
