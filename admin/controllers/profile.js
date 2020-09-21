const Profile = require("../models/profile");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     Get Profile
exports.getProfile = async (req, res, next) => {
  try {
    const { admin } = req;
    const profile = await Profile.getProfile(admin);

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { admin } = req;
    ErrorResponse.validateRequest(req);
    const profile = await Profile.updateProfile(admin, req.body);

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Change Password
exports.changePassword = async (req, res, next) => {
  try {
    const { admin } = req;
    const { oldpassword, password } = req.body;

    ErrorResponse.validateRequest(req);

    const profile = await Profile.changePassword(admin, oldpassword, password);

    res.status(201).json({ success: true, data: "" });
  } catch (err) {
    next(err);
  }
};
