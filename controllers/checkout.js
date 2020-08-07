const Cart = require("../models/cart");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   PROTECTED
//@desc     Prepare order
exports.getCheckout = async (req, res, next) => {
  try {
    const user_id = req.user;
    const data = {
      user_id,
    };

    const cartItems = await Cart.getCart(data);

    const totals = await Cart.getTotals(cartItems.products);

    res.status(200).json({ success: true, data: { ...cartItems, totals } });
  } catch (err) {
    next(err);
  }
};
