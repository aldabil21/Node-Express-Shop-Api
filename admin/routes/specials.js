const express = require("express");
const router = express.Router();
const {
  getProductSpecials,
  addProductSpecial,
  updateProductSpecial,
  deleteProductSpecial,
} = require("../controllers/specials");
const { specialSchema } = require("../validators/specials");
const authorize = require("../middlewares/authorize");

//@route    GET
//@access   ADMIN
//@desc     Get Product specials
router.get(
  "/:product_id/specials",
  authorize(["Owner", "Administrator", "Manager", "Seller"]),
  getProductSpecials
);

//@route    POST
//@access   ADMIN
//@desc     Add Product special
router.post(
  "/:product_id/specials",
  authorize(["Owner", "Administrator", "Manager"]),
  specialSchema,
  addProductSpecial
);

//@route    PUT
//@access   ADMIN
//@desc     Update Product special
router.put(
  "/:product_id/specials/:id",
  authorize(["Owner", "Administrator", "Manager"]),
  specialSchema,
  updateProductSpecial
);

//@route    DELETE
//@access   ADMIN
//@desc     Delete Product special
router.delete(
  "/:product_id/specials/:id",
  authorize(["Owner", "Administrator", "Manager"]),
  deleteProductSpecial
);

module.exports = router;
