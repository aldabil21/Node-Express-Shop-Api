const express = require("express");
const router = express.Router();
const {
  getCheckout,
  addCoupunPoints,
  // editCartItem,
  // deleteCartItem,
} = require("../controllers/checkout");
const { checkoutValidator, CPValidator } = require("../validators/checkout");

const protected = require("../middlewares/protected");

router.use(protected);

//@route    GET
//@access   PROTECTED
//@desc     Prepare order (Add/Update) order form user cart and get checkout
router.get("/", getCheckout);

//@route    PATCH
//@access   PROTECTED
//@desc     Add coupon or points to totals
router.patch("/", CPValidator, addCoupunPoints);

// //@route    PUT
// //@access   PROTECTED
// //@desc     Edit cart item
// router.put("/:id", cartSchema, editCartItem);

// //@route    DELETE
// //@access   PUBLIC
// //@desc     Delete cart item
// router.delete("/:id", deleteCartItem);

module.exports = router;
