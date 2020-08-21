const express = require("express");
const router = express.Router();
const {
  getCheckout,
  addCouponDiscount,
  addPointsDiscount,
  patchPaymentMethod,
  confirmCheckout,
} = require("../controllers/checkout");
const {
  couponValidator,
  pointsValidator,
  paymentValidator,
  checkoutValidator,
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

//@route    PATCH
//@access   PROTECTED
//@desc     edit order payment method
router.patch("/payment", paymentValidator, patchPaymentMethod);

//@route    PUT
//@access   PROTECTED
//@desc     Confirm checkout
router.post("/", checkoutValidator, confirmCheckout);

module.exports = router;
