const express = require("express");
const router = express.Router();
const { getProduct, getProducts } = require("../controllers/product");

//@route    GET
//@access   PUBLIC
//@desc     GET All Products
router.get("/", getProducts);

//@route    GET
//@access   PUBLIC
//@desc     GET Product by ID
router.get("/:id", getProduct);

module.exports = router;
