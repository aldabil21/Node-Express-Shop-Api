const Cart = require("../models/cart");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   PUBLIC
//@desc     Get cart
exports.getCart = async (req, res, next) => {
  try {
    let user_id;
    if (req.user) {
      user_id = req.user;
    }
    user_id = req.guest;
    const data = {
      user_id,
    };
    const cart = await Cart.getCart(data);
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   PUBLIC
//@desc     Add to cart
exports.addToCart = async (req, res, next) => {
  try {
    let user_id;
    if (req.user) {
      user_id = req.user;
    }
    user_id = req.guest;
    const data = {
      ...req.body,
      user_id,
    };

    ErrorResponse.validateRequest(req);

    const item = await Cart.add(data);

    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// //@route    PUT
// //@access   ADMIN
// //@desc     Update Filter
// exports.updateFilter = async (req, res, next) => {
//   const { id } = req.params;
//   const data = {
//     id,
//     ...req.body,
//   };

//   try {
//     ErrorResponse.validateRequest(req);
//     const filter = await Filters.updateFilter(data);
//     res.status(200).json({ success: true, data: filter });
//   } catch (err) {
//     next(err);
//   }
// };

// //@route    DELETE
// //@access   ADMIN
// //@desc     Delete Filter
// exports.deleteFilter = async (req, res, next) => {
//   const { id } = req.params;

//   try {
//     await Filters.getFilter(id, false);
//     const deletedId = await Filters.deleteFilter(id);
//     res.status(200).json({ success: true, data: deletedId });
//   } catch (err) {
//     next(err);
//   }
// };
