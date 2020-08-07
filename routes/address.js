const express = require("express");
const router = express.Router();
const {
  getAddress,
  getAddresses,
  addAddress,
  // updateProductSpecial,
  // deleteProductSpecial,
} = require("../controllers/address");
const { addressSchema } = require("../validators/address");

const protected = require("../middlewares/protected");

router.use(protected);

//@route    GET
//@access   PROTECTED
//@desc     Get address by ID
router.get("/:id", getAddress);

//@route    GET
//@access   PROTECTED
//@desc     Get user address
router.get("/", getAddresses);

//@route    POST
//@access   PROTECTED
//@desc     Add user address
router.post("/", addressSchema, addAddress);

// //@route    PUT
// //@access   ADMIN
// //@desc     Update Product special
// router.put("/:product_id/specials/:id", specialSchema, updateProductSpecial);

// //@route    DELETE
// //@access   ADMIN
// //@desc     Delete Product special
// router.delete("/:product_id/specials/:id", deleteProductSpecial);

module.exports = router;
