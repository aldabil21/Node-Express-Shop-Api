const Checkout = require("../models/checkout");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Point = require("../models/point");
const Address = require("../models/address");
const Settings = require("../models/settings");
const ErrorResponse = require("../helpers/error");
const i18next = require("../i18next");
const { format } = require("date-fns");
const { default: axios } = require("axios");

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
      points: {},
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

      //Get user points for display if enabled
      const info = await Point.getInfo(user_id);
      if (info) {
        checkoutInfo.points = { info, ...checkoutInfo.points };
      }
    } else {
      checkoutInfo.notice = i18next.t("cart:checkout_not_found_products");
    }

    const checkout = {
      notice: orderInfo.notice || checkoutInfo.notice,
      addresses,
      payment_methods,
      coupon: checkoutInfo.coupon,
      points: checkoutInfo.points,
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
//@desc     Add coupon discount to totals
exports.addCouponDiscount = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { coupon } = req.body;

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
    };

    //Validate coupon => redeem
    let existCoupon;
    if (coupon) {
      const couponResult = await Coupon.validate(data);
      if (!couponResult.valid) {
        throw new ErrorResponse(400, couponResult.message);
      }
      data.coupon = couponResult.couponInfo;

      const redeemed = await Checkout.redeemCoupon(data);
      if (redeemed.value) {
        existCoupon = {
          title: couponResult.couponInfo.title,
          code: couponResult.couponInfo.code,
          notice: i18next.t("cart:congrats_coupon", {
            code: couponResult.couponInfo.code,
          }),
        };
      }
    } else {
      //Remove coupon
      await Checkout.clearCoupon(data.order_id);
    }

    //Get final order totals
    const totals = await Checkout.getTotals(data.order_id);

    res.status(200).json({
      success: true,
      data: { coupon: existCoupon, totals },
    });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   PROTECTED
//@desc     Add points discount to totals
exports.addPointsDiscount = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { points } = req.body;

    ErrorResponse.validateRequest(req);

    //Get user current order
    const order = await Checkout.getUncompleteOrder({ user_id });
    if (!order) {
      throw new ErrorResponse(400, i18next.t("cart:order_not_found_try_again"));
    }
    const data = {
      order_id: order.order_id,
      user_id,
      points,
    };

    //Validate points => redeem
    let existPoints;
    if (points) {
      const pointsResult = await Point.validate(data);

      if (!pointsResult.valid) {
        throw new ErrorResponse(400, pointsResult.message);
      }
      data.points = pointsResult.maxPoints;
      data.discountVal = pointsResult.maxDiscount;
      const redeemed = await Checkout.redeemPoints(data);
      if (redeemed.value) {
        existPoints = {
          info: pointsResult.info,
          value: pointsResult.maxPoints,
          notice: i18next.t("cart:congrats_points", { total: redeemed.value }),
          warning: pointsResult.message,
        };
      }
    } else {
      await Checkout.clearPoints(data.order_id);
    }

    //Get final order totals
    const totals = await Checkout.getTotals(data.order_id);

    res.status(200).json({
      success: true,
      data: { points: existPoints, totals },
    });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   PROTECTED
//@desc     edit order payment method
exports.patchPaymentMethod = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { payment_method } = req.body;

    ErrorResponse.validateRequest(req);

    //Get user current order
    const hasOrder = await Checkout.getUncompleteOrder({ user_id });
    if (!hasOrder) {
      throw new ErrorResponse(400, i18next.t("cart:order_not_found_try_again"));
    }
    const data = {
      order_id: hasOrder.order_id,
      user_id,
      payment_method,
    };

    // Change payment method in order
    const pay_meth = await Checkout.updatePayment(data);

    // TODO: get Tap cards
    let cards;
    if (pay_meth === "credit_card") {
      cards = [
        { card_id: 1, first_six: "112233" },
        { card_id: 2, first_six: "445566" },
      ];
    }

    res.status(200).json({
      success: true,
      data: {
        payment_method: pay_meth,
        cards,
      },
    });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   PROTECTED
//@desc     Confirm checkout
exports.confirmCheckout = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { address_id, card_id } = req.body;

    ErrorResponse.validateRequest(req);

    //Get user current order
    const hasOrder = await Checkout.getUncompleteOrder({ user_id });
    if (!hasOrder) {
      throw new ErrorResponse(400, i18next.t("cart:order_not_found_try_again"));
    }

    const payment = hasOrder.payment_method;
    if (!payment) {
      throw new ErrorResponse(422, i18next.t("cart:choose_payment_method"));
    }

    //Refresh order + revalidate products/quantities
    const orderData = {
      order_id: hasOrder.order_id,
      user_id,
      address_id,
      payment_method: payment,
    };
    const refreshedOrder = await Checkout.updateOrder(orderData);

    //product changed during checkout
    if (refreshedOrder.notice) {
      throw new ErrorResponse(
        400,
        `${refreshedOrder.notice}. ${i18next.t("common:refresh_try_again")}`
      );
    }

    //Handle confirm
    let redirect = false;
    let order_id = hasOrder.order_id;
    let data;
    //if COD
    if (payment === "cod") {
      //OR if(!card_id) then payment is COD. //TODO: check max allowed total for COD (to be addded)
      const codData = {
        order_id,
        user_id,
        comment: i18next.t("cart:initial_order_comment"),
      };
      await Checkout.confirm(codData);
    } else if (payment === "credit_card") {
      //Deal later
    }

    // const response = await axios.post(
    //   "https://api.tap.company/v2/charges",
    //   {
    //     amount: "1",
    //     currency: "SAR",
    //     customer: {
    //       // id: "",
    //       first_name: "First Name",
    //       email: "email@email.com",
    //       phone: {
    //         country_code: "966",
    //         number: "555666777",
    //       },
    //     },
    //     threeDSecure: false,
    //     source: {
    //       id: "tok_CKGH41311012Zpz6527182",
    //     },
    //     redirect: {
    //       url: "https://red.com",
    //     },
    //   },
    //   {
    //     headers: {
    //       Authorization: "Bearer sk_test_ARN3yxOEl9GJakqoFt8if0rB",
    //     },
    //   }
    // );
    // const chargesRes = response.data;

    // const charges = await axios.post(
    //   "https://api.tap.company/v2/charges/list",
    //   {},
    //   {
    //     headers: {
    //       Authorization: "Bearer sk_test_ARN3yxOEl9GJakqoFt8if0rB",
    //     },
    //   }
    // );
    // const chr = charges.data;

    res.status(200).json({
      success: true,
      redirect: redirect,
      date: data,
    });
  } catch (err) {
    next(err);
  }
};
