const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  rawAutocomplete,
  switchStatus,
} = require("../controllers/categories");
const { categorySchema } = require("../validators/category");
const authorize = require("../middlewares/authorize");
const multer = require("../helpers/multer");

router.use(authorize);

//@route    GET
//@access   ADMIN
//@desc     GET All categories (raw auto-complete)
router.get("/autocomplete", rawAutocomplete);

//@route    GET
//@access   ADMIN
//@desc     GET All categories (with auto-complete)
router.get("/", getAllCategories);

//@route    GET
//@access   ADMIN
//@desc     GET Category by ID
router.get("/:id", getCategory);

//@route    POST
//@access   ADMIN
//@desc     Add Category
router.post("/", multer.single("image"), categorySchema, addCategory);

//@route    PUT
//@access   ADMIN
//@desc     Update category
router.put("/:id", multer.single("image"), categorySchema, updateCategory);

//@route    PATCH
//@access   ADMIN
//@desc     Switch category status
router.patch("/:id", switchStatus);

//@route    DELETE
//@access   ADMIN
//@desc     Delete category
router.delete("/:id", deleteCategory);

module.exports = router;
