const express = require("express");
const router = express.Router();
const { getDir, createDir, deleteDir } = require("../controllers/filesystem");
const {
  upload,
  getFile,
  updateFile,
  getGalleries,
  createGallery,
  getGallery,
  updateGallery,
  deleteGallery,
  switchGalleryStatus,
} = require("../controllers/media");
const multer = require("../helpers/multer");
const {
  validDirname,
  pathQuery,
  galleryValidator,
  validDelete,
  validFile,
} = require("../validators/media");
const authorize = require("../middlewares/authorize");
const { getSanitizer } = require("../validators/generals");

router.use(authorize(["Owner", "Administrator", "Manager", "Seller"]));
router.use(pathQuery);

/**
 * Gallery
 * */
//@route    GET
//@access   ADMIN
//@desc     Get Galleries List
router.get("/gallery", getSanitizer, getGalleries);
//@route    GET
//@access   ADMIN
//@desc     Get Gallery by ID
router.get("/gallery/:id", getGallery);
//@route    POST
//@access   ADMIN
//@desc     Create Gallery
router.post("/gallery", galleryValidator, createGallery);
//@route    PUT
//@access   ADMIN
//@desc     Update Gallery
router.put("/gallery/:id", galleryValidator, updateGallery);
//@route    DELETE
//@access   ADMIN
//@desc     Delete Gallery by ID
router.delete("/gallery/:id", deleteGallery);
//@route    PATH
//@access   ADMIN
//@desc     Switch Gallery Status
router.patch("/gallery/:id", switchGalleryStatus);

/**
 * Media library
 */
//@route    GET
//@access   ADMIN
//@desc     Get Media Dirs
router.get("/", getDir);
//@route    GET
//@access   ADMIN
//@desc     Get File Details
router.get("/:id", getFile);
//@route    PUT
//@access   ADMIN
//@desc     Edit File Details
router.put("/:id", validFile, updateFile);
//@route    POST
//@access   ADMIN
//@desc     Create Media Dir
router.post("/", validDirname, createDir);
//@route    DELETE
//@access   ADMIN
//@desc     Delete Media Dir by Name (Multiple)
router.delete("/", deleteDir);
//@route    POST
//@access   ADMIN
//@desc     Upload Media
router.post("/upload", multer.single("file"), upload);

module.exports = router;
