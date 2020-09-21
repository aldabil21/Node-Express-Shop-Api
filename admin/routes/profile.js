const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/profile");

const authorize = require("../middlewares/authorize");
const { profileSchema, passUpdate } = require("../validators/profile");

router.use(authorize(["Owner", "Administrator", "Manager", "Seller"]));

//@route    GET
//@access   ADMIN
//@desc     Get Profile
router.get("/", getProfile);

//@route    PUT
//@access   ADMIN
//@desc     Update Profile
router.put("/", profileSchema, updateProfile);

//@route    PATCH
//@access   ADMIN
//@desc     Change Password
router.patch("/", passUpdate, changePassword);

module.exports = router;
