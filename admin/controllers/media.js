const Media = require("../models/media");
const Taxonomy = require("../models/taxonomy");
const ErrorResponse = require("../../helpers/error");
const { i18next } = require("../../i18next");

//@route    POST
//@access   ADMIN
//@desc     Upload Media
exports.upload = async (req, res, next) => {
  try {
    const admin_id = req.admin;
    if (!req.file) {
      throw new ErrorResponse(422, i18next.t("filesystem:upload_err"));
    }

    const savedUrl = await Media.saveMedia(req.file, admin_id, req);
    res.status(201).json({ success: true, data: savedUrl });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get File Info
exports.getFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await Media.getFileDetail(id);

    if (!file) {
      throw new ErrorResponse(
        422,
        i18next.t("filesystem:file_not_found", { id })
      );
    }
    const categories = await Taxonomy.getAllRaw({ type: "media_category" });
    const tags = await Taxonomy.getAllRaw({ type: "media_tag" });

    res.status(200).json({ success: true, data: { file, categories, tags } });
  } catch (err) {
    next(err);
  }
};
//@route    PUT
//@access   ADMIN
//@desc     Edit File Details
exports.updateFile = async (req, res, next) => {
  try {
    ErrorResponse.validateRequest(req);
    const { id } = req.params;
    const file = await Media.updateFileDetail(id, req.body);
    if (!file) {
      throw new ErrorResponse(
        422,
        i18next.t("filesystem:file_not_found", { id })
      );
    }

    res.status(200).json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};
/**
 * Gallery
 */
//@route    GET
//@access   ADMIN
//@desc     Get Galleries List
exports.getGalleries = async (req, res, next) => {
  try {
    const data = req.query;

    const galleries = await Media.getGalleries(data);
    const totalCount = await Media.getTotalGalleries(data);
    const pagination = {
      totalCount,
      currentPage: +data.page,
      perPage: +data.perPage,
      totalPages: Math.ceil(totalCount / data.perPage),
    };
    res.status(200).json({ success: true, data: { galleries, pagination } });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get Gallery by ID
exports.getGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gallery = await Media.getGalleryForEdit(id);
    if (!gallery) {
      throw new ErrorResponse(
        404,
        i18next.t("gallery:gallery_not_found", { id: id })
      );
    }
    res.status(200).json({ success: true, data: gallery });
  } catch (err) {
    next(err);
  }
};
//@route    POST
//@access   ADMIN
//@desc     Create Gallery
exports.createGallery = async (req, res, next) => {
  try {
    const data = req.body;
    ErrorResponse.validateRequest(req);
    const gallery = await Media.addGallery(data);
    res.status(201).json({ success: true, data: gallery });
  } catch (err) {
    next(err);
  }
};
//@route    PUT
//@access   ADMIN
//@desc     Update Gallery
exports.updateGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = {
      id,
      ...req.body,
    };
    ErrorResponse.validateRequest(req);
    const gallery = await Media.updateGallery(data);
    res.status(200).json({ success: true, data: gallery });
  } catch (err) {
    next(err);
  }
};
//@route    DELETE
//@access   ADMIN
//@desc     Delete Gallery by ID
exports.deleteGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedId = await Media.deleteGallery(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};
//@route    PATH
//@access   ADMIN
//@desc     Switch Gallery Status
exports.switchGalleryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const _status = await Media.switchGalleryStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
