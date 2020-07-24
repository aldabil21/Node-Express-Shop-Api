const express = require("express");
const router = express.Router();
const prodController = require("../controllers/product");
const { productSchema } = require("../validators/product");

//@route    GET
//@access   PUBLIC
//@desc     GET All Products
router.get("/products", prodController.getProducts);

//@route    GET
//@access   PUBLIC
//@desc     GET Product by ID
router.get("/products/:id", prodController.getProduct);

//@route    POST
//@access   ADMIN
//@desc     ADD Product
router.post("/products", productSchema, prodController.addProduct);

//@route    PUT
//@access   ADMIN
//@desc     Update Product
router.put("/products/:id", productSchema, prodController.updateProduct);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Product by ID
router.delete("/products/:id", prodController.deleteProduct);

module.exports = router;
