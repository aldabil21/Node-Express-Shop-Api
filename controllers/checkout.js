const Checkout = require("../models/checkout");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Address = require("../models/address");
const Settings = require("../models/settings");
const ErrorResponse = require("../helpers/error");
const i18next = require("../i18next");
const { format } = require("date-fns");

//@route    GET
//@access   PROTECTED
//@desc     Prepare order
exports.getCheckout = async (req, res, next) => {
  try {
    const user_id = req.user;
    const data = {
      user_id,
    };

    //Has cart
    const hasCart = await Cart.hasCart(data);

    //Has uncompleted order
    const hasOrder = await Checkout.getUncompleteOrder(data);

    //Add or update order accordingly
    let orderInfo = {
      order_id: "",
      notice: "",
    };
    let addresses = [];
    let payment_methods = [];
    let checkoutInfo = {
      notice: "",
      coupon: {},
      products: [],
      totals: [],
    };
    if (hasCart) {
      if (hasOrder) {
        data.order_id = hasOrder.order_id;
        data.address_id = hasOrder.address_id;
        orderInfo = await Checkout.updateOrder(data);
      } else {
        orderInfo = await Checkout.addOrder(data);
      }

      //Get checkout orderInfo after Add/Update
      checkoutInfo = await Checkout.getCheckout({
        order_id: orderInfo.order_id,
        user_id,
      });

      //Get addresses
      addresses = await Address.getAddresses({ user_id });

      //Get payment methods
      const payments = Settings.getSettings("payment_methods");
      for (const key in payments) {
        const title = Settings.getSetting("payment_method", `${key}_title`);
        payment_methods.push({
          code: key,
          title: i18next.t(`cart:${title[`${key}_title`]}`),
          status: payments[key],
        });
      }
    } else {
      checkoutInfo.notice = i18next.t("cart:checkout_not_found_products");
    }

    const checkout = {
      notice: orderInfo.notice || checkoutInfo.notice,
      addresses,
      payment_methods,
      coupon: checkoutInfo.coupon,
      products: checkoutInfo.products,
      totals: checkoutInfo.totals,
    };

    res.status(200).json({ success: true, data: checkout });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   PROTECTED
//@desc     Add coupon or points to totals
exports.addCoupunPoints = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { coupon, points } = req.body;

    ErrorResponse.validateRequest(req);

    //Get user current order
    const order = await Checkout.getUncompleteOrder({ user_id });
    if (!order) {
      throw new ErrorResponse(400, i18next.t("cart:order_not_found_try_again"));
    }
    const data = {
      order_id: order.order_id,
      user_id,
      code: coupon,
      points,
    };

    //Validate coupon => redeem
    let existCoupon;
    if (coupon) {
      const couponResult = await Coupon.validate(data);
      if (!couponResult.valid) {
        throw new ErrorResponse(400, couponResult.message);
      }
      existCoupon = {
        title: couponResult.couponInfo.title,
        code: couponResult.couponInfo.code,
        notice: i18next.t("cart:congrats_coupon", {
          code: couponResult.couponInfo.code,
        }),
      };
      data.coupon = couponResult.couponInfo;
      await Checkout.RedeemCoupon(data);
    }

    //TODO: Validate points => redeem
    let existPoints;

    //Get final order totals
    const totals = await Checkout.getTotals(data.order_id);

    res.status(200).json({
      success: true,
      data: { coupon: existCoupon, points: existPoints, totals },
    });
  } catch (err) {
    next(err);
  }
};
