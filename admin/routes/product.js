const express = require("express");
const router = express.Router();
const {
  getProduct,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  switchStatus,
  rawAutocomplete,
} = require("../controllers/product");
const { productSchema, queryVal } = require("../validators/product");
const authorize = require("../middlewares/authorize");
const upload = require("../helpers/multer");

router.use(authorize);

//@route    GET
//@access   ADMIN
//@desc     GET All products (raw auto-complete)
router.get("/autocomplete", rawAutocomplete);

//@route    GET
//@access   ADMIN
//@desc     GET All Products
router.get("/", queryVal, getProducts);

//@route    GET
//@access   ADMIN
//@desc     GET Product by ID
router.get("/:id", getProduct);

//@route    POST
//@access   ADMIN
//@desc     ADD Product
router.post("/", upload.array("image"), productSchema, addProduct);

//@route    PUT
//@access   ADMIN
//@desc     Update Product
router.put("/:id", upload.array("image"), productSchema, updateProduct);

//@route    PATCH
//@access   ADMIN
//@desc     Switch product status
router.patch("/:id", queryVal, switchStatus);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Product by ID
router.delete("/:id", deleteProduct);

module.exports = router;
