const express = require("express");
const router = express.Router();
const {
  getCheckout,
  // addToCart,
  // editCartItem,
  // deleteCartItem,
} = require("../controllers/checkout");
// const { cartSchema } = require("../validators/cart");

const protected = require("../middlewares/protected");

router.use(protected);

//@route    GET
//@access   PROTECTED
//@desc     Prepare order
router.get("/", getCheckout);

// //@route    POST
// //@access   PUBLIC
// //@desc     Add to cart
// router.post("/", cartSchema, addToCart);

// //@route    PUT
// //@access   PUBLIC
// //@desc     Edit cart item
// router.put("/:id", cartSchema, editCartItem);

// //@route    DELETE
// //@access   PUBLIC
// //@desc     Delete cart item
// router.delete("/:id", deleteCartItem);

module.exports = router;
