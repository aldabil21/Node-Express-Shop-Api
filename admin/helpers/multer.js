const multer = require("multer");
const { format } = require("date-fns");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const nameArr = file.originalname.split(".");
    const name = nameArr.slice(0, nameArr.length - 1).join("_");
    const clean_name = name.replace(/[^\w.]/g, "_");
    const extention = path.extname(file.originalname);
    const dateSign = format(new Date(), "yyyyMMddhhmmss");
    cb(null, `${clean_name}_${dateSign + extention}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 120000 },
});
