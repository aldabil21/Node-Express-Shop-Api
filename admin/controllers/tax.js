const Tax = require("../models/tax");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   ADMIN
//@desc     Tax search/autocomplete
exports.autocomplete = async (req, res, next) => {
  try {
    const { q } = req.query;
    const taxes = await Tax.autocomplete(q);
    res.status(200).json({ success: true, data: taxes });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get All Taxes
exports.getTaxes = async (req, res, next) => {
  try {
    const { page, perPage, sort, direction, q } = req.query;
    const data = {
      page: page || 1,
      perPage: perPage || 20,
      sort,
      direction: direction || "DESC",
      q: q || "",
    };
    const taxes = await Tax.getTaxes(data);
    res.status(200).json({ success: true, data: taxes });
  } catch (err) {
    next(err);
  }
};

// //@route    POST
// //@access   ADMIN
// //@desc     Add Product special
// exports.addProductSpecial = async (req, res, next) => {
//   const { product_id } = req.params;
//   const data = {
//     product_id,
//     ...req.body,
//   };

//   try {
//     ErrorResponse.validateRequest(req);
//     const specials = await Specials.addProductSpecial(data);
//     res.status(201).json({ success: true, data: specials });
//   } catch (err) {
//     next(err);
//   }
// };

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

// //@route    DELETtaxe Product special
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