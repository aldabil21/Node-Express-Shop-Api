const Product = require("../models/product");
const Address = require("../models/address");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   PROTECTED
//@desc     Get address by id
exports.getAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user;

    const address = await Address.getAddress(id, user_id);
    res.status(200).json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   PROTECTED
//@desc     Get user addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user_id = req.user;
    const data = {
      user_id,
    };

    const addresses = await Address.getAddresses(data);
    res.status(200).json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   PROTECTED
//@desc     Add user address
exports.addAddress = async (req, res, next) => {
  try {
    const user_id = req.user;
    const data = {
      user_id,
      ...req.body,
    };

    ErrorResponse.validateRequest(req);
    const address = await Address.add(data);
    res.status(201).json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

// //@route    PUT
// //@access   ADMIN
// //@desc     Update Product special
// exports.updateProductSpecial = async (req, res, next) => {
//   const { product_id, id } = req.params;
//   const data = {
//     product_id,
//     id,
//     ...req.body,
//   };

//   try {
//     ErrorResponse.validateRequest(req);
//     const specials = await Specials.updateProductSpecial(data);
//     res.status(200).json({ success: true, data: specials });
//   } catch (err) {
//     next(err);
//   }
// };

// //@route    DELETE
// //@access   ADMIN
// //@desc     Delete Product special
// exports.deleteProductSpecial = async (req, res, next) => {
//   const { product_id, id } = req.params;

//   try {
//     // await Product.findOneProduct(product_id);
//     const deletedId = await Specials.deleteProductSpecial(id);
//     res.status(200).json({ success: true, data: deletedId });
//   } catch (err) {
//     next(err);
//   }
// };
