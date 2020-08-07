const express = require("express");
const router = express.Router();
const {
  getAllFilters,
  addFilter,
  updateFilter,
  deleteFilter,
} = require("../controllers/filters");
const { filterSchema } = require("../validators/filter");
const authorize = require("../middlewares/authorize");

router.use(authorize("admin"));

//@route    GET
//@access   ADMIN
//@desc     GET All filters (with auto-complete)
router.get("/", getAllFilters);

//@route    POST
//@access   ADMIN
//@desc     Add filter
router.post("/", filterSchema, addFilter);

//@route    PUT
//@access   ADMIN
//@desc     Update Filter
router.put("/:id", filterSchema, updateFilter);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Filter
router.delete("/:id", deleteFilter);

module.exports = router;
