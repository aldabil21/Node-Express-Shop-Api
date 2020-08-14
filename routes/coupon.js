const express = require("express");
const router = express.Router();
const {
  getCoupons,
  getCoupon,
  addCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon");
const { couponSchema } = require("../validators/coupon");
const authorize = require("../middlewares/authorize");

router.use(authorize("admin"));

//@route    GET
//@access   ADMIN
//@desc     Get Coupons
router.get("/", getCoupons);

//@route    GET
//@access   ADMIN
//@desc     Get Coupon by ID
router.get("/:id", getCoupon);

//@route    POST
//@access   ADMIN
//@desc     Add Coupon
router.post("/", couponSchema, addCoupon);

//@route    PUT
//@access   ADMIN
//@desc     Update Coupon
router.put("/:id", couponSchema, updateCoupon);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Coupun
router.delete("/:id", deleteCoupon);

module.exports = router;
