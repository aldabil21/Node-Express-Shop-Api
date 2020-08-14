const express = require("express");
const router = express.Router();
const {
  getCheckout,
  addCouponDiscount,
  addPointsDiscount,
  // editCartItem,
  // deleteCartItem,
} = require("../controllers/checkout");
const {
  checkoutValidator,
  couponValidator,
  pointsValidator,
} = require("../validators/checkout");

const protected = require("../middlewares/protected");

router.use(protected);

//@route    GET
//@access   PROTECTED
//@desc     Prepare order (Add/Update) order form user cart and get checkout
router.get("/", getCheckout);

//@route    PATCH
//@access   PROTECTED
//@desc     Add coupon discount to totals
router.patch("/coupon", couponValidator, addCouponDiscount);

//@route    PATCH
//@access   PROTECTED
//@desc     Add points discount to totals
router.patch("/points", pointsValidator, addPointsDiscount);

// //@route    PUT
// //@access   PROTECTED
// //@desc     Edit cart item
// router.put("/:id", cartSchema, editCartItem);

// //@route    DELETE
// //@access   PUBLIC
// //@desc     Delete cart item
// router.delete("/:id", deleteCartItem);

module.exports = router;
