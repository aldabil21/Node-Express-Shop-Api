const Orders = require("../models/orders");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     GET All orders
exports.getAllOrders = async (req, res, next) => {
  const {
    q = "",
    page = 1,
    perPage = 20,
    sort = "date_added",
    direction = "ASC",
    payment_method = "",
    order_status = "",
  } = req.query;

  const data = {
    q,
    page,
    perPage,
    sort,
    direction,
    payment_method,
    order_status,
  };

  try {
    const orders = await Orders.getOrders(data);
    const totalCount = await Orders.getTotalOrders(data);
    let pagination = {
      totalCount: totalCount,
      currentPage: +data.page,
      perPage: +data.perPage,
      totalPages: Math.ceil(totalCount / perPage),
    };

    res.status(200).json({ success: true, data: { orders, pagination } });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET Order By ID
exports.getOrder = async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Orders.getOrder(id);

    if (!order || !order.order_id) {
      throw new ErrorResponse(
        404,
        i18next.t("order:order_not_found", { id: id })
      );
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Add order history
exports.addHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment, status_id, tracking, company } = req.body;
    const data = { order_id: id, comment, status_id, tracking, company };

    ErrorResponse.validateRequest(req);

    const history = await Orders.addHistory(data);

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};
//@route    GET
//@access   ADMIN
//@desc     GET All Order Statuses
exports.getStatuses = async (req, res, next) => {
  try {
    const statuses = await Orders.getStatuses();
    res.status(200).json({ success: true, data: statuses });
  } catch (err) {
    next(err);
  }
};
