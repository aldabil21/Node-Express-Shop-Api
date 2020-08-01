const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  editCartItem,
  deleteCartItem,
} = require("../controllers/cart");
const { cartSchema } = require("../validators/cart");

//@route    GET
//@access   PUBLIC
//@desc     Get cart
router.get("/", getCart);

//@route    POST
//@access   PUBLIC
//@desc     Add to cart
router.post("/", cartSchema, addToCart);

//@route    PUT
//@access   PUBLIC
//@desc     Edit cart item
router.put("/:id", cartSchema, editCartItem);

//@route    DELETE
//@access   PUBLIC
//@desc     Delete cart item
router.delete("/:id", deleteCartItem);

module.exports = router;
