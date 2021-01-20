const syspath = require("path");
const db = require("../config/db");

exports.getMediaById = async (id) => {
  if (!id) {
    return {
      // media_id: "0",
      isDir: false,
      ext: ".png",
      path: staticHost + "/media/no_photo.png",
      isImg: true,
    };
  }

  const [result, _] = await db.query(
    `SELECT DISTINCT * FROM media WHERE media_id = '${id}'`
  );
  let media = {};
  if (result.length) {
    _media = result[0];
    const parse = syspath.parse(_media.url);
    media.isImg = isImage(_media);
    media.isDir = false;
    media.ext = parse.ext;
    media.name = parse.name;
    media.path = staticHost + _media.url;
    media.media_id = _media.media_id;
  }
  return media;
};

const isImage = (file, ext) => {
  // Perhaps consider using a lib like mmmagic/magic numbers etx...
  let _ext;
  if (file) {
    ext = syspath.parse(file.url).ext;
  } else if (ext) {
    _ext = ext;
  }
  const mt = [".png", ".gif", ".jpg", ".jpeg", ".bmp", ".webp"];
  return mt.includes(ext);
};
