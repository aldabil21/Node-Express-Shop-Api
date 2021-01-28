const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");
const Quotation = require("../models/quotation");

// @route    GET
// @access   ADMIN
// @desc     Get Quotation Settings
exports.getQuotationSettings = async (req, res, next) => {
  try {
    const sheets = await Quotation.getSheets();
    res.status(200).json({ sucess: true, data: { sheets } });
  } catch (error) {
    next(error);
  }
};
// @route    GET
// @access   ADMIN
// @desc     Get Sheets List
exports.getSheets = async (req, res, next) => {
  try {
    // No pagination - Not that much of sheets anyway
    const sheets = await Quotation.getSheets();
    res.status(200).json({ sucess: true, data: sheets });
  } catch (error) {
    next(error);
  }
};
// @route    GET
// @access   ADMIN
// @desc     Get Sheet By ID
exports.getSheet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sheet = await Quotation.getSheetByIdForEdit(id);
    if (!sheet) {
      throw new ErrorResponse(
        404,
        i18next.t("quotation:sheet_not_found", { id })
      );
    }
    res.status(200).json({ sucess: true, data: sheet });
  } catch (error) {
    next(error);
  }
};
// @route    POST
// @access   ADMIN
// @desc     Add New Sheet
exports.addSheet = async (req, res, next) => {
  try {
    ErrorResponse.validateRequest(req);
    const sheet = await Quotation.addSheet(req.body);
    res.status(201).json({ sucess: true, data: sheet });
  } catch (error) {
    next(error);
  }
};
// @route    PUT
// @access   ADMIN
// @desc     Update Sheet by ID
exports.updateSheet = async (req, res, next) => {
  try {
    ErrorResponse.validateRequest(req);
    const { id } = req.params;
    const updatedSheet = await Quotation.updateSheet({ id, ...req.body });
    res.status(201).json({ sucess: true, data: updatedSheet });
  } catch (error) {
    next(error);
  }
};
// @route    DELETE
// @access   ADMIN
// @desc     DELETE Sheet By ID
exports.deleteSheet = async (req, res, next) => {
  const { id } = req.params;
  try {
    // await Filters.getFilter(id, false);
    const deletedId = await Quotation.deleteSheet(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};
// @route    PATCH
// @access   ADMIN
// @desc     Switch Sheet Status
exports.switchSheetStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const _status = await Quotation.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
