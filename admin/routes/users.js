const express = require("express");
const router = express.Router();
const { getUsers, switchStatus } = require("../controllers/users");

const authorize = require("../middlewares/authorize");

router.use(authorize(["Owner", "Administrator", "Manager"]));

//@route    GET
//@access   ADMIN
//@desc     Get All Users
router.get("/", getUsers);

//@route    PATCH
//@access   ADMIN
//@desc     Switch user status
router.patch("/:id", switchStatus);

module.exports = router;
