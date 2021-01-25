const express = require("express");
const router = express.Router();
const {
  getAlbumById,
  getGalleryTaxonomies,
  getMediaById,
} = require("../controllers/media");
const { galleryGet } = require("../validators/media");

//@route    GET
//@access   PUBLIC
//@desc     Get album with search/filter
router.get("/gallery", galleryGet, getAlbumById);
//@route    GET
//@access   PUBLIC
//@desc     Get media taxonomies for filtering
router.get("/gallery/taxonomy", getGalleryTaxonomies);

//@route    GET
//@access   PUBLIC
//@desc     Get Media ID
router.get("/:id", getMediaById);
module.exports = router;
