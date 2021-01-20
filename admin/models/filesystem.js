const syspath = require("path");
const fs = require("fs");
const fsPromise = fs.promises;
const Media = require("./media");

exports.GetDir = async (path) => {
  const mediaPath = syspath.join(__rootpath, "media", ...path);
  const urlPath = syspath.join("media", ...path);
  //Check path existance
  const exists = await Media.dirExists(mediaPath);
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
      // const media = await Media.getMediaByUrl(mediaPath);
      // if (media.media_id) {
      //   folder.push({
      //     isDir,
      //     ...media,
      //   });
      // }
    }
  }
  return folder;
};

exports.deleteFromDisk = async (path) => {
  const filePath = syspath.join(__rootpath, ...path.split("/"));
  const fexists = await Media.dirExists(filePath);
  if (fexists) {
    await fsPromise.unlink(filePath);
  }
};
