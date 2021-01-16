const express = require("express");
const router = express.Router();
const {
  getCoupons,
  getCoupon,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  switchStatus,
} = require("../controllers/coupon");
const { couponSchema, getSanitizer } = require("../validators/coupon");
const authorize = require("../middlewares/authorize");

//@route    GET
//@access   ADMIN
//@desc     Get Coupons
router.get(
  "/",
  authorize(["Owner", "Administrator", "Manager", "Seller"]),
  getSanitizer,
  getCoupons
);

//@route    GET
//@access   ADMIN
//@desc     Get Coupon by ID
router.get(
  "/:id",
  authorize(["Owner", "Administrator", "Manager", "Seller"]),
  getCoupon
);

//@route    POST
//@access   ADMIN
//@desc     Add Coupon
router.post(
  "/",
  authorize(["Owner", "Administrator", "Manager"]),
  couponSchema,
  addCoupon
);

//@route    PUT
//@access   ADMIN
//@desc     Update Coupon
router.put(
  "/:id",
  authorize(["Owner", "Administrator", "Manager"]),
  couponSchema,
  updateCoupon
);

//@route    PUT
//@access   ADMIN
//@desc     Switch Coupon status
router.patch(
  "/:id",
  authorize(["Owner", "Administrator", "Manager"]),
  switchStatus
);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Coupun
router.delete(
  "/:id",
  authorize(["Owner", "Administrator", "Manager"]),
  deleteCoupon
);

module.exports = router;
