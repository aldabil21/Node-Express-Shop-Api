const Coupon = require("../models/coupon");
const ErrorResponse = require("../../helpers/error");
const i18next = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     Get Coupons w pagination & search
exports.getCoupons = async (req, res, next) => {
  const {
    q = "",
    page = 1,
    perPage = 20,
    sort = "date_added",
    direction = "ASC",
  } = req.query;

  const data = {
    q,
    page,
    perPage,
    sort,
    direction,
  };

  try {
    const coupons = await Coupon.getCoupons(data);
    const totalCount = await Coupon.getTotalCoupons(data);

    const pagination = {
      totalCount,
      currentPage: +page,
      perPage: +perPage,
      totalPages: Math.ceil(totalCount / perPage),
    };

    res.status(200).json({ success: true, data: { coupons, pagination } });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get Coupon by ID
exports.getCoupon = async (req, res, next) => {
  const { id } = req.params;
  try {
    ErrorResponse.validateRequest(req);

    const coupon = await Coupon.getCoupon(id);

    if (!coupon) {
      throw new ErrorResponse(404, i18next.t("common:not_found", { id }));
    }

    res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Coupon
exports.addCoupon = async (req, res, next) => {
  try {
    const data = req.body;
    ErrorResponse.validateRequest(req);
    const coupon = await Coupon.addCoupon(data);

    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Coupon
exports.updateCoupon = async (req, res, next) => {
  const { id } = req.params;
  const data = {
    id,
    ...req.body,
  };

  try {
    ErrorResponse.validateRequest(req);
    const coupon = await Coupon.updateCoupon(data);
    res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete Coupon
exports.deleteCoupon = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedId = await Coupon.deleteCoupon(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};
