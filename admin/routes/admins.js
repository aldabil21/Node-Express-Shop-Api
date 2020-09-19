const express = require("express");
const router = express.Router();
const {
  getAdmins,
  getAdmin,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  switchStatus,
  requestPasswordReset,
} = require("../controllers/admins");

const authorize = require("../middlewares/authorize");
const { adminSchema } = require("../validators/admin");

router.use(authorize(["Owner", "Administrator"]));

//@route    GET
//@access   ADMIN
//@desc     Get All Admins
router.get("/", getAdmins);

//@route    GET
//@access   ADMIN
//@desc     Get Admin by ID
router.get("/:id", getAdmin);

//@route    POST
//@access   ADMIN
//@desc     Add Admin
router.post("/", adminSchema, addAdmin);

//@route    PUT
//@access   ADMIN
//@desc     Update Admin
router.put("/:id", adminSchema, updateAdmin);

//@route    PATCH
//@access   ADMIN
//@desc     Switch Admin status
router.patch("/:id", switchStatus);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Admin
router.delete("/:id", deleteAdmin);

//@route    POST
//@access   ADMIN
//@desc     Reset password
router.post("/reset/:id", requestPasswordReset);

module.exports = router;
