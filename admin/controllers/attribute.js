const Attribute = require("../models/attribute");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     Attributes search/autocomplete
exports.autocomplete = async (req, res, next) => {
  try {
    const { q } = req.query;
    const attributes = await Attribute.autocomplete(q);
    res.status(200).json({ success: true, data: attributes });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get All Attributes
exports.getAttributes = async (req, res, next) => {
  try {
    const { page, perPage, sort, direction, q } = req.query;
    const data = {
      page: page || 1,
      perPage: perPage || 20,
      sort,
      direction: direction || "DESC",
      q: q || "",
    };
    const attributes = await Attribute.getAttributes(data);
    const totalCount = await Attribute.getTotalAttributes(data);
    const pagination = {
      totalCount,
      currentPage: +data.page,
      perPage: +data.perPage,
      totalPages: Math.ceil(totalCount / data.perPage),
    };
    res.status(200).json({ success: true, data: { attributes, pagination } });
  } catch (err) {
    next(err);
  }
};
//@route    GET
//@access   ADMIN
//@desc     Get Attribute by ID
exports.getAttribute = async (req, res, next) => {
  const { id } = req.params;

  try {
    const attribute = await Attribute.getAttributeForEdit(id);
    if (!attribute) {
      throw new ErrorResponse(
        404,
        i18next.t("attribute:attribute_not_found", { id: id })
      );
    }
    res.status(200).json({ success: true, data: attribute });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Attribute
exports.addAttribute = async (req, res, next) => {
  const data = req.body;
  try {
    ErrorResponse.validateRequest(req);
    const attribute = await Attribute.addAttribute(data);
    res.status(201).json({ success: true, data: attribute });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Attribute
exports.updateAttribute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = {
      id,
      ...req.body,
    };
    ErrorResponse.validateRequest(req);
    const attribute = await Attribute.updateAttribute(data);
    res.status(200).json({ success: true, data: attribute });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete Attribute
exports.deleteAttribute = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedId = await Attribute.deleteAttribute(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch attribute status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const _status = await Attribute.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
