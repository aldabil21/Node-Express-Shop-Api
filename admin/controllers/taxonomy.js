const Taxonomy = require("../models/taxonomy");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     GET All taxonomies (w pagination & auto-complete)
exports.getAllTaxonomies = async (req, res, next) => {
  try {
    ErrorResponse.validateRequest(req);
    const data = req.query;
    const taxonomies = await Taxonomy.getParentTaxonomies(data);
    const totalCount = await Taxonomy.getTotalTaxonomies(data);
    let pagination;

    if (data.expand === "children") {
      //get taxonomy children
      //Add pagination only in expand mode, otherwise will only get all parents for select parent input
      if (taxonomies.length) {
        for (const taxonomy of taxonomies) {
          taxonomy.children = await Taxonomy.getChildTaxonomies(
            taxonomy.taxonomy_id,
            data.type
          );
        }
      }
      pagination = {
        totalCount,
        currentPage: +data.page,
        perPage: +data.perPage,
        totalPages: Math.ceil(totalCount / data.perPage),
      };
    }

    res.status(200).json({ success: true, data: { taxonomies, pagination } });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET Taxonomy by ID
exports.getTaxonomy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const taxonomy = await Taxonomy.getTaxonomyForEdit(id);

    if (!taxonomy) {
      throw new ErrorResponse(
        404,
        i18next.t("taxonomy:taxonomy_not_found", { id: id })
      );
    }

    res.status(200).json({ success: true, data: taxonomy });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Taxonomy
exports.addTaxonomy = async (req, res, next) => {
  try {
    ErrorResponse.validateRequest(req);
    const taxonomy = await Taxonomy.addTaxonomy(req.body);
    res.status(201).json({ success: true, data: taxonomy });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Taxonomy
exports.updateTaxonomy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const data = {
      id,
      ...body,
    };
    ErrorResponse.validateRequest(req);
    const taxonomy = await Taxonomy.updateTaxonomy(data);
    res.status(200).json({ success: true, data: taxonomy });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete taxonomy
exports.deleteTaxonomy = async (req, res, next) => {
  const { id } = req.params;
  try {
    // await Taxonomy.getTaxonomy(id, false);
    const deletedId = await Taxonomy.deleteTaxonomy(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET All Taxonomies (raw auto-complete)
exports.rawAutocomplete = async (req, res, next) => {
  try {
    ErrorResponse.validateRequest(req);
    const taxonomies = await Taxonomy.getAllRaw(req.query);
    res.status(200).json({ success: true, data: taxonomies });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch taxonomy status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const _status = await Taxonomy.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
