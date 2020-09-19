const express = require("express");
const router = express.Router();
const {
  getAllFilters,
  getFilter,
  addFilter,
  updateFilter,
  deleteFilter,
  rawAutocomplete,
  switchStatus,
} = require("../controllers/filters");
const { filterSchema } = require("../validators/filter");
const authorize = require("../middlewares/authorize");

router.use(authorize(["Owner", "Administrator", "Manager", "Seller"]));

//@route    GET
//@access   ADMIN
//@desc     GET All filters (raw auto-complete)
router.get("/autocomplete", rawAutocomplete);

//@route    GET
//@access   ADMIN
//@desc     GET All filters (with auto-complete)
router.get("/", getAllFilters);

//@route    GET
//@access   ADMIN
//@desc     GET Filter by ID
router.get("/:id", getFilter);

//@route    POST
//@access   ADMIN
//@desc     Add filter
router.post("/", filterSchema, addFilter);

//@route    PUT
//@access   ADMIN
//@desc     Update Filter
router.put("/:id", filterSchema, updateFilter);

//@route    PATCH
//@access   ADMIN
//@desc     Switch filter status
router.patch("/:id", switchStatus);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Filter
router.delete("/:id", deleteFilter);

module.exports = router;
