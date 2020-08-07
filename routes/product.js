const express = require("express");
const router = express.Router();
const {
  getProduct,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");
const { productSchema } = require("../validators/product");
const authorize = require("../middlewares/authorize");

//@route    GET
//@access   PUBLIC
//@desc     GET All Products
router.get("/", getProducts);

//@route    GET
//@access   PUBLIC
//@desc     GET Product by ID
router.get("/:id", getProduct);

//@route    POST
//@access   ADMIN
//@desc     ADD Product
router.post("/", authorize("admin"), productSchema, addProduct);

//@route    PUT
//@access   ADMIN
//@desc     Update Product
router.put("/:id", authorize("admin"), productSchema, updateProduct);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Product by ID
router.delete("/:id", authorize("admin"), deleteProduct);

module.exports = router;
