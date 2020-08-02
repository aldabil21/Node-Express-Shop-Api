const Cart = require("../models/cart");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   PUBLIC
//@desc     Get cart
exports.getCart = async (req, res, next) => {
  try {
    let user_id = req.guest;
    if (req.user) {
      user_id = req.user;
    }
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
    let user_id = req.guest;
    if (req.user) {
      user_id = req.user;
    }
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

//@route    PUT
//@access   PUBLIC
//@desc     Edit cart item
exports.editCartItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    let user_id = req.guest;
    if (req.user) {
      user_id = req.user;
    }
    const data = {
      id,
      ...req.body,
      user_id,
    };
    ErrorResponse.validateRequest(req);
    const updatedCart = await Cart.edit(data);
    res.status(200).json({ success: true, data: updatedCart });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   PUBLIC
//@desc     Delete cart item
exports.deleteCartItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    let user_id = req.guest;
    if (req.user) {
      user_id = req.user;
    }
    const data = {
      id,
      user_id,
    };

    const deletedId = await Cart.delete(data);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};
