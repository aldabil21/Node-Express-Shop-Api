const express = require("express");
const router = express.Router();
const {
  getProductSpecials,
  addProductSpecial,
  updateProductSpecial,
  deleteProductSpecial,
} = require("../controllers/specials");
const { specialSchema } = require("../validators/product_special");
const authorize = require("../middlewares/authorize");

router.use(authorize("admin"));

//@route    GET
//@access   ADMIN
//@desc     Get Product specials
router.get("/:product_id/specials", getProductSpecials);

//@route    POST
//@access   ADMIN
//@desc     Add Product special
router.post("/:product_id/specials", specialSchema, addProductSpecial);

//@route    PUT
//@access   ADMIN
//@desc     Update Product special
router.put("/:product_id/specials/:id", specialSchema, updateProductSpecial);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Product special
router.delete("/:product_id/specials/:id", deleteProductSpecial);

module.exports = router;
