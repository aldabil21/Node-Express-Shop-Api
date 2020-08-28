const express = require("express");
const router = express.Router();
const {
  getProduct,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");
const { productSchema, queryVal } = require("../validators/product");
const authorize = require("../middlewares/authorize");
const { query } = require("express-validator");

router.use(authorize);

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
router.post("/", productSchema, addProduct);

//@route    PUT
//@access   ADMIN
//@desc     Update Product
router.put("/:id", productSchema, updateProduct);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Product by ID
router.delete("/:id", deleteProduct);

module.exports = router;
