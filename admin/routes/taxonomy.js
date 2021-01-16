const express = require("express");
const router = express.Router();
const {
  getAllTaxonomies,
  getTaxonomy,
  addTaxonomy,
  updateTaxonomy,
  switchStatus,
  rawAutocomplete,
  deleteTaxonomy,
} = require("../controllers/taxonomy");
const { taxonomySchema, getValidate } = require("../validators/taxonomy");
const authorize = require("../middlewares/authorize");

router.use(authorize(["Owner", "Administrator", "Manager", "Seller"]));

//@route    GET
//@access   ADMIN
//@desc     GET All Taxonomies by Type (raw auto-complete)
router.get("/autocomplete", getValidate, rawAutocomplete);

//@route    GET
//@access   ADMIN
//@desc     GET All Taxonomies by Type (with auto-complete)
router.get("/", getValidate, getAllTaxonomies);

// @route    GET
// @access   ADMIN
// @desc     GET Taxonomy by ID
router.get("/:id", getTaxonomy);

//@route    POST
//@access   ADMIN
//@desc     Add Taxonomy
router.post("/", taxonomySchema, addTaxonomy);

//@route    PUT
//@access   ADMIN
//@desc     Update Taxonomy
router.put("/:id", taxonomySchema, updateTaxonomy);

//@route    PATCH
//@access   ADMIN
//@desc     Switch Taxonomy Status
router.patch("/:id", switchStatus);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Taxonomy
router.delete("/:id", deleteTaxonomy);

module.exports = router;
