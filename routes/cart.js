const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  editCartItem,
  deleteCartItem,
} = require("../controllers/cart");
const { cartSchema } = require("../validators/cart");
const ifAuth = require("../middlewares/ifAuth");

//if Auth user_id = user_id else user_id = guestId
router.use(ifAuth);

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
