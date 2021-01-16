const fs = require("fs");
const fsPromise = fs.promises;
const syspath = require("path");
const Media = require("../models/media");
const ErrorResponse = require("../../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     Get Media Dirs
exports.getDir = async (req, res, next) => {
  try {
    const { path } = req.query;

    const mediaPath = syspath.join(__rootpath, "media", ...path);
    const urlPath = syspath.join("media", ...path);

    //Check path existance
    const exists = await dirExists(mediaPath);
    if (!exists) {
      const { name } = syspath.parse(mediaPath);
      throw new ErrorResponse(
        404,
        i18next.t("filesystem:directory_not_found", { name })
      );
    }
    //Read Dir content
    const files = await fsPromise.readdir(mediaPath, {
      encoding: "utf-8",
      withFileTypes: true,
    });
    const folder = [];
    for (const file of files) {
      const parse = syspath.parse(file.name);
      const isDir = file.isDirectory();
      const mediaPath = `/${urlPath}/${file.name}`;
      if (isDir) {
        folder.push({
          isDir,
          ext: parse.ext,
          title: parse.name,
          path: staticHost + mediaPath,
        });
      } else {
        const media = await Media.getMediaByUrl(mediaPath);
        if (media.media_id) {
          folder.push({
            isDir,
            ...media,
          });
        }
      }
    }
    const sortedFiles = folder
      .sort((f) => f.isDir && -1)
      .map((f, i) => {
        return { ...f, index: i };
      });
    res.status(200).json({ success: true, data: sortedFiles });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Create Media Dir
exports.createDir = async (req, res, next) => {
  try {
    ErrorResponse.validateRequest(req);

    const { path } = req.query;
    const { dirname } = req.body;
    const mediaPath = syspath.join(__rootpath, "media", ...path, dirname);

    //Check path existance
    const exists = await dirExists(mediaPath);
    if (exists) {
      throw new ErrorResponse(
        404,
        i18next.t("filesystem:directory_exists", { name: dirname })
      );
    }

    //Create dir
    await fsPromise.mkdir(mediaPath, { mode: "0755" });

    res.status(200).json({ success: true, data: dirname });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete Media Dir by Name (Multiple)
exports.deleteDir = async (req, res, next) => {
  try {
    // ErrorResponse.validateRequest(req);
    const { path, file, type } = req.query;

    if (!file || !type) {
      throw new ErrorResponse(403, i18next.t("filesystem:cannot_delete_media"));
    }

    if (type === "dir") {
      // Check path existance
      const dirPath = syspath.join(__rootpath, "media", ...path, file);
      const exists = await dirExists(dirPath);
      if (!exists) {
        throw new ErrorResponse(
          404,
          i18next.t("filesystem:directory_not_found", { name: dirname })
        );
      }

      await fsPromise.rmdir(dirPath, { recursive: true });
      //Silently delete DB records of the files nested in this dir
      const nestedPaths = syspath.join("/media", ...path, file);
      Media.deleteNestedMedia(nestedPaths);
    } else {
      const _deleted = await Media.deleteMedia(file);
      const filePath = syspath.join(__rootpath, ..._deleted.url.split("/"));
      const fexists = await dirExists(filePath);
      if (fexists) {
        fsPromise.unlink(filePath);
      }
    }

    // // Delete multiple dirs
    // for (const dir of dirs) {
    //   const dirPath = syspath.join(__rootpath, "media", ...path, dir);
    //   await fsPromise.rmdir(dirPath, { recursive: true });
    //   //how to deal with the record of child files media in db?
    // }
    // for (const file of files) {
    //   const filePath = syspath.join(__rootpath, "media", ...path, file);
    //   await fsPromise.unlink(filePath);
    //   // delete media files with taxonomy relation
    // }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

const dirExists = async (path) => {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });
};
