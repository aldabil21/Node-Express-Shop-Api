const Tax = require("../models/tax");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     Tax search/autocomplete
exports.autocomplete = async (req, res, next) => {
  try {
    const { q } = req.query;
    const taxes = await Tax.autocomplete(q);
    res.status(200).json({ success: true, data: taxes });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get All Taxes
exports.getTaxes = async (req, res, next) => {
  try {
    const { page, perPage, sort, direction, q } = req.query;
    const data = {
      page: page || 1,
      perPage: perPage || 20,
      sort,
      direction: direction || "DESC",
      q: q || "",
    };
    const taxes = await Tax.getTaxes(data);
    res.status(200).json({ success: true, data: taxes });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get Tax by ID
exports.getTax = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tax = await Tax.getById(id);
    if (!tax) {
      throw new ErrorResponse(
        404,
        i18next.t("settings:tax_not_found", { id: id })
      );
    }
    res.status(200).json({ success: true, data: tax });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Tax
exports.addTax = async (req, res, next) => {
  try {
    const data = req.body;

    ErrorResponse.validateRequest(req);
    const specials = await Tax.addTax(data);
    res.status(201).json({ success: true, data: specials });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Tax
exports.updateTax = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = {
      id,
      ...req.body,
    };
    ErrorResponse.validateRequest(req);
    const tax = await Tax.updateTax(data);
    res.status(200).json({ success: true, data: tax });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete Tax
exports.deleteTax = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedId = await Tax.deleteTax(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch tax status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const _status = await Tax.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
