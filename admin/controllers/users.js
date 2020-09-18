const Users = require("../models/users");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     Get All Users
exports.getUsers = async (req, res, next) => {
  try {
    const { page, perPage, sort, direction, q } = req.query;
    const data = {
      page: page || 1,
      perPage: perPage || 20,
      sort,
      direction: direction || "DESC",
      q: q || "",
    };
    const users = await Users.getUsers(data);
    const totalCount = await Users.getTotalUsers(data);
    const pagination = {
      totalCount,
      currentPage: +data.page,
      perPage: +data.perPage,
      totalPages: Math.ceil(totalCount / data.perPage),
    };
    res.status(200).json({ success: true, data: { users, pagination } });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch user status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const _status = await Users.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
