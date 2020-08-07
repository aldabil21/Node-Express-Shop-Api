const express = require("express");
const router = express.Router();
const { signup, signin, confirmOTP, signout } = require("../controllers/auth");
const { userSchema, isOTP, isSignin } = require("../validators/user");
const protected = require("../middlewares/protected");

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

//@route    POST
//@access   PROTECTED
//@desc     Sign out
router.post("/signout", protected, signout);

//TODO: routes: reset password -

module.exports = router;
