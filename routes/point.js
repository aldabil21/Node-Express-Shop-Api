const express = require("express");
const router = express.Router();
const { getPoints } = require("../controllers/point");
const protected = require("../middlewares/protected");
// const { couponSchema } = require("../validators/coupon");

router.use(protected);

//@route    GET
//@access   PROTECTED
//@desc     Get user Points
router.get("/", getPoints);

module.exports = router;
