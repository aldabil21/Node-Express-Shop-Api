const Filters = require("../models/filters");
const ErrorResponse = require("../helpers/error");
const i18next = require("../../i18next");

//@route    GET
//@access   Admin
//@desc     GET filters w pagination
exports.getAllFilters = async (req, res, next) => {
  const {
    q = "",
    page = 1,
    perPage = 20,
    sort = "sort_order",
    direction = "ASC",
    expand = "",
  } = req.query;

  const data = {
    q,
    page,
    perPage,
    sort,
    direction,
    expand,
  };

  try {
    const filters = await Filters.getParentFilters(data);
    const totalCount = await Filters.getTotalFilters(data);
    let pagination;
    if (expand === "children") {
      //get filter children
      //Add pagination only in expand mode, otherwise will only get all parents
      if (filters.length) {
        for (const filter of filters) {
          filter.children = await Filters.getChildFilters(filter.filter_id);
        }
      }
      pagination = {
        totalCount,
        currentPage: +page,
        perPage: +perPage,
        totalPages: Math.ceil(totalCount / perPage),
      };
    }

    res.status(200).json({ success: true, data: { filters, pagination } });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET Filter by ID
exports.getFilter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const filter = await Filters.getFilterForEdit(id);

    if (!filter) {
      throw new ErrorResponse(
        404,
        i18next.t("filter:filter_not_found", { id: id })
      );
    }

    res.status(200).json({ success: true, data: filter });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Filter
exports.addFilter = async (req, res, next) => {
  const data = req.body;
  try {
    ErrorResponse.validateRequest(req);
    const filter = await Filters.addFilter(data);
    res.status(201).json({ success: true, data: filter });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Filter
exports.updateFilter = async (req, res, next) => {
  const { id } = req.params;
  const data = {
    id,
    ...req.body,
  };

  try {
    ErrorResponse.validateRequest(req);
    const filter = await Filters.updateFilter(data);
    res.status(200).json({ success: true, data: filter });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete Filter
exports.deleteFilter = async (req, res, next) => {
  const { id } = req.params;

  try {
    // await Filters.getFilter(id, false);
    const deletedId = await Filters.deleteFilter(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET All Filters (raw auto-complete)
exports.rawAutocomplete = async (req, res, next) => {
  const { q } = req.query;
  try {
    const filters = await Filters.getAllRaw(q);

    res.status(200).json({ success: true, data: filters });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch filter status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const _status = await Filters.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
