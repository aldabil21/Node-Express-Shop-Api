const Tap = require("../models/tap");
const User = require("../models/user");
const TapAPI = require("../helpers/tapInstance");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   PROTECTED
//@desc     Get Tap cards
exports.getCards = async (req, res, next) => {
  try {
    const user_id = req.user;

    // const address = await Address.getAddress(id, user_id);
    res.status(200).json({ success: true, data: "address" });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   PROTECTED
//@desc     Add Tap card from SDK token (toc_id)
exports.addCard = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { tok_id } = req.body;
    let tapCustomer;

    ErrorResponse.validateRequest(req);

    //Get Tap customer
    tapCustomer = await Tap.getCustomer(user_id);

    // //Create Tap customer if not exist
    // if (!tapCustomer) {
    //   tapCustomer = await Tap.createCustomer(user_id);
    // }

    // const card = await Tap.saveCard(tapCustomer.tap_id, tok_id, user_id);
    // const card = await Tap.getCustomersFromTap();

    res.status(201).json({ success: true, data: card });
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
