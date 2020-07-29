const Product = require("../models/product");
const Specials = require("../models/specials");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   ADMIN
//@desc     GET Product specials
exports.getProductSpecials = async (req, res, next) => {
  const { product_id } = req.params;

  try {
    const specials = await Specials.getProductSpecials(product_id);
    res.status(200).json({ success: true, data: specials });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Product special
exports.addProductSpecial = async (req, res, next) => {
  const { product_id } = req.params;
  const data = {
    product_id,
    ...req.body,
  };

  try {
    ErrorResponse.validateRequest(req);
    const specials = await Specials.addProductSpecial(data);
    res.status(201).json({ success: true, data: specials });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Product special
exports.updateProductSpecial = async (req, res, next) => {
  const { product_id, id } = req.params;
  const data = {
    product_id,
    id,
    ...req.body,
  };

  try {
    ErrorResponse.validateRequest(req);
    const specials = await Specials.updateProductSpecial(data);
    res.status(200).json({ success: true, data: specials });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete Product special
exports.deleteProductSpecial = async (req, res, next) => {
  const { product_id, id } = req.params;

  try {
    // await Product.findOneProduct(product_id);
    const deletedId = await Specials.deleteProductSpecial(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};
