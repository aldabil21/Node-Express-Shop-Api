const express = require("express");
const router = express.Router();
const {
  getAttributes,
  autocomplete,
  getAttribute,
  addAttribute,
  updateAttribute,
  deleteAttribute,
  switchStatus,
} = require("../controllers/attribute");
const { attributeSchema } = require("../validators/attribute");
const authorize = require("../middlewares/authorize");

router.use(authorize);

//@route    GET
//@access   ADMIN
//@desc     Attributes search/autocomplete
router.get("/autocomplete", autocomplete);

//@route    GET
//@access   ADMIN
//@desc     Get All Attributes
router.get("/", getAttributes);

//@route    GET
//@access   ADMIN
//@desc     Get Attribute by ID
router.get("/:id", getAttribute);

//@route    POST
//@access   ADMIN
//@desc     Add Attribute
router.post("/", attributeSchema, addAttribute);

//@route    PUT
//@access   ADMIN
//@desc     Edit Attribute
router.put("/:id", attributeSchema, updateAttribute);

//@route    PATCH
//@access   ADMIN
//@desc     Switch attribute status
router.patch("/:id", switchStatus);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Attribute
router.delete("/:id", deleteAttribute);

module.exports = router;
