const express = require("express");
const router = express.Router();
const { signup, signin, confirmOTP } = require("../controllers/auth");
const { userSchema, isOTP, isSignin } = require("../validators/user");

//@route    POST
//@access   PUBLIC
//@desc     Sign up new user
router.post("/signup", userSchema, signup);

//@route    POST
//@access   PUBLIC
//@desc     Confirm OTP
router.post("/otp", isOTP, confirmOTP);

//@route    POST
//@access   PUBLIC
//@desc     Sign in
router.post("/signin", isSignin, signin);

// //@route    PUT
// //@access   PUBLIC
// //@desc     Edit cart item
// router.put("/:id", cartSchema, editCartItem);

// //@route    DELETE
// //@access   PUBLIC
// //@desc     Delete cart item
// router.delete("/:id", deleteCartItem);

module.exports = router;
