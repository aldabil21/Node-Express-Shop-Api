const Media = require("../models/media");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../i18next");

//@route    GET
//@access   PUBLIC
//@desc     Get album with search/filter
exports.getAlbumById = async (req, res, next) => {
  try {
    const { id, page, perPage } = req.query;
    const album = await Media.getAlbumById(req.query);
    if (!album) {
      throw new ErrorResponse(404, i18next.t("media:album_not_found", { id }));
    }

    const totalCount = await Media.getAlbumTotalImagesCount(req.query);
    const pagination = {
      totalCount,
      currentPage: +page,
      perPage: +perPage,
      totalPages: Math.ceil(totalCount / +perPage),
    };
    res.status(200).json({ success: true, data: { album, pagination } });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   PUBLIC
//@desc     Get gallery taxonomies for filtering
exports.getGalleryTaxonomies = async (req, res, next) => {
  try {
    const taxonomies = await Media.getGalleryTaxonomies(req.query);
    res.status(200).json({ success: true, data: taxonomies });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   PUBLIC
//@desc     Get Media ID
exports.getMediaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const media = await Media.getMediaById(id, "original", true);
    res.status(200).json({ success: true, data: media });
  } catch (err) {
    next(err);
  }
};
