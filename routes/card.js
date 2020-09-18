const express = require("express");
const router = express.Router();
const {
  getCards,
  addCard,
  //   deleteCard
} = require("../controllers/card");
const protected = require("../middlewares/protected");
const { cardValidator } = require("../validators/card");
const { i18next } = require("../i18next");

router.use(protected);

// @route    GET
// @access   PROTECTED
// @desc     Get Tap Cards
router.get("/", getCards);

//@route    POST
//@access   PROTECTED
//@desc     Add Tap Card (token id)
router.post("/", cardValidator, addCard);

// //@route    PUT
// //@access   PROTECTED
// //@desc     Update Coupon
// router.put("/:id", couponSchema, updateCoupon);

// //@route    DELETE
// //@access   PROTECTED
// //@desc     Delete Coupun
// router.delete("/:id", deleteCoupon);

module.exports = router;
