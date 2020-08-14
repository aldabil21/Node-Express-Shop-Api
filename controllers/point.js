const Point = require("../models/point");
const ErrorResponse = require("../helpers/error");
const i18next = require("../i18next");

//@route    GET
//@access   PROTECTED
//@desc     Get user Points
exports.getPoints = async (req, res, next) => {
  const { page, perPage } = req.query;

  try {
    const user_id = req.user;
    const data = {
      user_id,
      page: page || 1,
      perPage: perPage || 20,
    };
    const points = await Point.getPoints(data);
    const total = await Point.getCurrentTotalPoints(data.user_id);
    const totalCount = await Point.getTotalCount(data);

    const pagination = {
      totalCount,
      currentPage: +data.page,
      perPage: +data.perPage,
      totalPages: Math.ceil(totalCount / +data.perPage),
    };

    res
      .status(200)
      .json({ success: true, data: { points, total, pagination } });
  } catch (err) {
    next(err);
  }
};
