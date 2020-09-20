const express = require("express");
const router = express.Router();
const {
  signin,
  signout,
  initApp,
  forgotPassword,
  validateForgotPassword,
  resetForgotPassword,
} = require("../controllers/auth");
const { isSignin } = require("../validators/admin");
const authorize = require("../middlewares/authorize");
const { isEmail, isPassword } = require("../validators/generals");

//@route    POST
//@access   ADMIN
//@desc     Init app - auto auth
router.post(
  "/",
  authorize(["Owner", "Administrator", "Manager", "Seller"]),
  initApp
);

//@route    POST
//@access   PUBLIC
//@desc     Sign in
router.post("/signin", isSignin, signin);

//@route    POST
//@access   ADMIN
//@desc     Sign out
router.post(
  "/signout",
  authorize(["Owner", "Administrator", "Manager", "Seller"]),
  signout
);

//@route    POST
//@access   PUBLIC
//@desc     Forgot password
router.post("/forgotpassword", isEmail, forgotPassword);

//@route    GET
//@access   PUBLIC
//@desc     Validate forgot password
router.get("/forgotpassword/:email/:token", validateForgotPassword);

//@route    POST
//@access   PUBLIC
//@desc     Validate forgot password
router.post("/forgotpassword/:email/:token", isPassword, resetForgotPassword);

module.exports = router;
