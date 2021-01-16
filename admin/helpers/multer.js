const multer = require("multer");
const { format } = require("date-fns");
const syspath = require("path");
const fs = require("fs");
const { CONSTANTS } = require("../../helpers/constants");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { path } = req.query;
    const root = "media";
    const saveIn = syspath.join(root, ...path);
    cb(null, saveIn);
  },
  filename: async (req, file, cb) => {
    const { path } = req.query;
    const root = "media";
    const fileInfo = syspath.parse(file.originalname);
    const name = fileInfo.name.replace(/[^a-z0-9]+/gi, "_");
    const extention = fileInfo.ext;
    const fileWithExt = name + extention;

    const saveIn = syspath.join(root, ...path, fileWithExt);
    const exists = await checkFileExists(saveIn);

    if (exists) {
      const dateSign = format(new Date(), "yyyyMMddhhmmss");
      cb(null, `${dateSign}_${fileWithExt}`);
    } else {
      cb(null, fileWithExt);
    }
  },
});

const fileFilter = (req, file, cb) => {
  if (CONSTANTS.mimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const checkFileExists = async (filepath) => {
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 16777216 },
});
