const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  rawAutocomplete,
} = require("../controllers/categories");
const { categorySchema } = require("../validators/category");
const authorize = require("../middlewares/authorize");

router.use(authorize);

//@route    GET
//@access   ADMIN
//@desc     GET All categories (with auto-complete)
router.get("/", getAllCategories);

//@route    POST
//@access   ADMIN
//@desc     Add Category
router.post("/", categorySchema, addCategory);

//@route    PUT
//@access   ADMIN
//@desc     Update category
router.put("/:id", categorySchema, updateCategory);

//@route    DELETE
//@access   ADMIN
//@desc     Delete category
router.delete("/:id", deleteCategory);

//@route    GET
//@access   ADMIN
//@desc     GET All categories (raw auto-complete)
router.get("/autocomplete", rawAutocomplete);

module.exports = router;
