const express = require("express");
const router = express.Router();
const { signin, signout, initApp } = require("../controllers/auth");
const { adminSchema, isOTP, isSignin } = require("../validators/admin");
const authorize = require("../middlewares/authorize");

//@route    POST
//@access   PUBLIC
//@desc     Sign in
router.post("/signin", isSignin, signin);

//@route    POST
//@access   ADMIN
//@desc     Sign out
router.post("/signout", authorize, signout);

//@route    POST
//@access   ADMIN
//@desc     Init app - auto auth
router.post("/", authorize, initApp);

//TODO: routes: reset password -

module.exports = router;
