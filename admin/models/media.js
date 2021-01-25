const fs = require("fs");
const fsPromise = fs.promises;
const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");
const syspath = require("path");
const { CONSTANTS } = require("../../helpers/constants");
const iMagic = require("gm").subClass({ imageMagick: true });
const Filesystem = require("./filesystem");

exports.getFiles = async (query, size = "thumbnail") => {
  const { q, page, perPage, sort, direction, path } = query;
  const _start = (page - 1) * perPage;
  const urlPath = syspath.join("/", "media", ...path);
  let sql = `
  SELECT DISTINCT m.media_id, m.title, m.mimetype,
  CASE WHEN m.is_image THEN
    (SELECT CONCAT('${staticHost}', url) FROM media_variation WHERE media_id = m.media_id AND code = '${size}')
    ELSE
    CONCAT('${staticHost}', m.url)
    END AS path,
  CASE WHEN m.is_image THEN
    (SELECT CONCAT('${staticHost}', url) FROM media_variation WHERE media_id = m.media_id AND code = 'webp_${size}')
    END AS webpPath
  FROM media m
  WHERE CONCAT_WS(m.title, m.url) LIKE '%${q}%' AND m.destination = '${urlPath}'
  ORDER BY m.${sort} ${direction} LIMIT ${_start}, ${perPage}`;
  const [files, _] = await db.query(sql);

  for (const file of files) {
    const parse = syspath.parse(file.path);
    file.ext = parse.ext;
    file.isImg = CONSTANTS.imageMime.includes(file.mimetype);
    file.isDir = false;
  }

  return files;
};
exports.getFilesTotalCount = async (query) => {
  const { q, page, perPage, sort, direction, path } = query;
  const _start = (page - 1) * perPage;
  const urlPath = syspath.join("/", "media", ...path);
  let sql = `
  SELECT DISTINCT COUNT(*) AS total
  FROM media m
  WHERE CONCAT_WS(m.title, m.url) LIKE '%${q}%' AND m.destination = '${urlPath}'
  `;
  const [res, _] = await db.query(sql);
  const { total } = res[0];
  return total;
};
exports.uploadMedia = withTransaction(
  async (transaction, file, uploaded_by) => {
    const { path, mimetype } = file;
    const { name, ext } = syspath.parse(path);
    const dbPath = syspath.join("/", path);
    const pathWithoutExt = syspath.join("/", file.destination, name);

    const isImage = this.isImage(null, mimetype);
    let _resizedPathes = [];
    let _webpPathes = [];

    if (isImage) {
      _resizedPathes = await this.resizeUploadedImages(
        dbPath,
        pathWithoutExt,
        ext
      );
      _webpPathes = await this.convertToWebP(_resizedPathes);
    }
    const [result, _] = await transaction.query(`INSERT INTO media SET ?`, {
      title: name,
      url: dbPath,
      destination: syspath.join("/", file.destination),
      mimetype,
      is_image: isImage,
      uploaded_by,
    });

    if (!result.insertId) {
      // url = null;
      throw new ErrorResponse(422, i18next.t("filesystem:upload_err"));
    }

    if ([..._resizedPathes, ..._webpPathes].length) {
      const values = [..._resizedPathes, ..._webpPathes].map((p) => [
        result.insertId,
        p.url,
        p.code,
      ]);
      let sql = ` INSERT INTO media_variation (media_id, url, code) VALUES ? `;
      await transaction.query(sql, [values]);
    }

    await transaction.commit();
    return this.getMediaById(result.insertId);
    // return {
    //   isDir: false,
    //   ext: ext,
    //   title: name,
    //   path: staticHost + pathWithoutExt + ".webp",
    //   media_id: result.insertId,
    //   isImg: isImage,
    // };
  }
);

exports.getMediaByUrl = async (url, isFullUrl) => {
  let __url = url;
  let noPhoto = this.getEmptyMedia();
  if (!__url) {
    return noPhoto;
  }
  if (isFullUrl) {
    __url = __url.split(staticHost)[1];
  }
  let sql = `
  SELECT m.media_id, m.title, CONCAT('${staticHost}',m.url) AS path,
  CONCAT(a.firstname, " ", a.lastname) AS uploader,
  CONCAT(
    '[',
      GROUP_CONCAT(DISTINCT
        CASE WHEN t.type = 'media_category' THEN
        JSON_OBJECT("id",tr.taxonomy_id, "title",td.title)
        END
        ) 
    ,']'
  ) AS categories,
  CONCAT(
    '[',
      GROUP_CONCAT(DISTINCT
        CASE WHEN t.type = 'media_tag' THEN
        JSON_OBJECT("id",tr.taxonomy_id, "title",td.title)
        END
        ) 
    ,']'
  ) AS tags
  FROM media m
  LEFT JOIN admin a ON(a.admin_id = m.uploaded_by)
  LEFT JOIN taxonomy_relationship tr ON(tr.object_id = m.media_id)
  LEFT JOIN taxonomy_description td ON(tr.taxonomy_id = td.taxonomy_id AND td.language = '${reqLanguage}')
  LEFT JOIN taxonomy t ON(t.taxonomy_id = tr.taxonomy_id)
  WHERE m.url = '${__url}' 
  `;
  const [result, _] = await db.query(sql);

  let file;
  if (result.length && result[0].media_id) {
    file = result[0];
    const parse = syspath.parse(file.path);
    file.isImg = this.isImage(file);
    file.isDir = false;
    file.ext = parse.ext;
    file.categories = JSON.parse(file.categories) || [];
    file.tags = JSON.parse(file.tags) || [];
    return file;
  } else {
    return noPhoto;
  }
};
exports.getFileDetail = async (id) => {
  const media_id = id > 0 ? id : 0;
  let sql = `
  SELECT m.media_id, m.title, m.destination, CONCAT('${staticHost}',m.url) AS path, m.date_added, m.is_image,
  CASE WHEN m.is_image THEN
  CONCAT(
    GROUP_CONCAT(DISTINCT CONCAT('${staticHost}',mv.url))
  )
  END AS links,
  CONCAT(a.firstname, " ", a.lastname) AS uploader,
  CONCAT(
    '[',
      GROUP_CONCAT(DISTINCT
        CASE WHEN t.type = 'media_category' THEN
        JSON_OBJECT("id",tr.taxonomy_id, "title",td.title)
        END
        ) 
    ,']'
  ) AS categories,
  CONCAT(
    '[',
      GROUP_CONCAT(DISTINCT
        CASE WHEN t.type = 'media_tag' THEN
        JSON_OBJECT("id",tr.taxonomy_id, "title",td.title)
        END
        ) 
    ,']'
  ) AS tags
  FROM media m
  LEFT JOIN admin a ON(a.admin_id = m.uploaded_by)
  LEFT JOIN taxonomy_relationship tr ON(tr.object_id = m.media_id)
  LEFT JOIN taxonomy_description td ON(tr.taxonomy_id = td.taxonomy_id AND td.language = '${reqLanguage}')
  LEFT JOIN taxonomy t ON(t.taxonomy_id = tr.taxonomy_id)
  LEFT JOIN media_variation mv ON(m.media_id = mv.media_id)
  WHERE m.media_id = '${media_id}' 
  `;
  const [result, _] = await db.query(sql);

  let file;
  if (result.length && result[0].media_id) {
    file = result[0];
    const parse = syspath.parse(file.path);
    // Dimension
    if (file.is_image) {
      const dimension = await this.getMediaDimension(file.path);
      file.dimension = dimension;
    }
    // Filesize
    const base = file.path.split(staticHost)[1];
    const filesize = await this.getMediaFileSize(base);
    file.filesize = filesize;
    // Others...
    file.isImg = this.isImage(file);
    file.isDir = false;
    file.ext = parse.ext;
    file.links = file.links ? file.links.split(",") : [];
    file.categories = JSON.parse(file.categories) || [];
    file.tags = JSON.parse(file.tags) || [];
  }

  return file;
};
exports.updateFileDetail = withTransaction(async (transaction, id, body) => {
  const [gallery, _] = await transaction.query(
    `UPDATE media SET ? WHERE media_id = '${id}'`,
    {
      title: body.title,
    }
  );

  await transaction.query(
    `DELETE tr FROM taxonomy_relationship tr LEFT JOIN taxonomy t 
    ON(t.type = 'media_category' OR t.type = "media_tag") WHERE object_id = '${id}'`
  );

  const taxos = [...body.categories, ...body.tags].map((m) => [id, m]);
  if (taxos.length) {
    let sql = ` INSERT INTO taxonomy_relationship (object_id, taxonomy_id) VALUES ? `;
    await transaction.query(sql, [taxos]);
  }

  await transaction.commit();

  return this.getFileDetail(id);
});
exports.deleteMedia = withTransaction(async (transaction, mediaId) => {
  const [media, __] = await transaction.query(
    `SELECT m.url,
    CASE WHEN m.is_image THEN
      GROUP_CONCAT(DISTINCT mv.url) 
      END AS urls
    FROM media m
    LEFT JOIN media_variation mv ON(m.media_id = mv.media_id)
    WHERE m.media_id = '${mediaId}'
    `
  );
  const [result, _] = await transaction.query(
    `DELETE FROM media WHERE media_id = '${mediaId}'`
  );
  for (const _m of media) {
    await Filesystem.deleteFromDisk(_m.url);
    if (_m.urls) {
      const urls = _m.urls.split(",");
      for (const url of urls) {
        await Filesystem.deleteFromDisk(url);
      }
    }
  }
  await transaction.commit();
  return media[0];
});

exports.deleteNestedMedia = async (path) => {
  let sql = `DELETE FROM media WHERE url LIKE '${path}%'`;
  await db.query(sql);
};
exports.getMediaById = async (id, size = "thumbnail") => {
  const noPhoto = this.getEmptyMedia();
  if (!id) {
    return noPhoto;
  }
  const [result, _] = await db.query(`
    SELECT DISTINCT m.media_id, m.title, m.mimetype, m.is_image AS isImg,
    CASE WHEN m.is_image THEN
      (SELECT CONCAT('${staticHost}', url) FROM media_variation WHERE media_id = m.media_id AND code = '${size}')
      ELSE
      CONCAT('${staticHost}', m.url)
      END AS path,
    CASE WHEN m.is_image THEN
      (SELECT CONCAT('${staticHost}', url) FROM media_variation WHERE media_id = m.media_id AND code = 'webp_${size}')
      END AS webpPath
    FROM media m WHERE media_id = '${id}'
  `);
  let media;
  if (result.length) {
    media = result[0];
    const parse = syspath.parse(media.path);
    media.isDir = false;
    media.ext = parse.ext;
    return media;
  } else {
    return noPhoto;
  }
};
exports.getEmptyMedia = () => {
  return {
    // media_id: "0",
    isDir: false,
    ext: ".png",
    path: staticHost + "/media/no_photo.png",
    isImg: true,
    title: "MISSING PHOTO",
  };
};

/**
 * Galleries
 */
exports.getGalleries = async (data) => {
  const { q, page, perPage, sort, direction } = data;

  const _start = (page - 1) * perPage;

  let sql = `SELECT * FROM gallery g
  LEFT JOIN gallery_description gd ON(g.gallery_id = gd.gallery_id)
  WHERE gd.language = '${reqLanguage}' AND gd.title LIKE '%${q}%'
  `;

  let sorter = "g";
  if (sort === "title") {
    sorter = "gd";
  }
  sql += ` ORDER BY ${sorter}.${sort} ${direction}`;
  sql += ` LIMIT ${_start}, ${perPage}`;

  const [galleries, fields] = await db.query(sql);

  return galleries;
};

exports.getGallery = async (gallery_id) => {
  let sql = `SELECT g.gallery_id, g.status, gd.title, gd.description,
  GROUP_CONCAT(DISTINCT gm.media_id) AS images
  FROM gallery g 
  LEFT JOIN gallery_description gd ON(g.gallery_id = gd.gallery_id)
  LEFT JOIN gallery_media gm ON(gm.gallery_id = g.gallery_id)
  WHERE g.gallery_id ='${gallery_id}' AND gd.language = '${reqLanguage}'
  `;
  const [query, fields] = await db.query(sql);

  let gallery;
  if (query.length) {
    gallery = query[0];
    const _images = gallery.images ? gallery.images.split(",") : [];
    let images = [];
    for (const img of _images) {
      const _img = await this.getMediaById(img);
      images.push(_img);
    }
    gallery.images = images;
  }

  return gallery;
};

exports.getGalleryForEdit = async (gallery_id) => {
  let sql = `SELECT g.gallery_id, g.status,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      JSON_OBJECT("language", gd.language, "title", gd.title, "description", gd.description)
      )
  ,']'
  )
  AS description,
  GROUP_CONCAT(DISTINCT gm.media_id) AS images
  FROM gallery g
  LEFT JOIN gallery_description gd ON(g.gallery_id = gd.gallery_id)
  LEFT JOIN gallery_media gm ON(gm.gallery_id = g.gallery_id) 
  WHERE g.gallery_id ='${gallery_id}'
  `;

  const [result, fields] = await db.query(sql);

  let gallery = result[0];
  if (gallery && gallery.gallery_id) {
    gallery.description = JSON.parse(gallery.description);
    const _images = gallery.images ? gallery.images.split(",") : [];
    let images = [];
    for (const img of _images) {
      const _img = await this.getMediaById(img);
      images.push(_img);
    }
    gallery.images = images;
  } else {
    gallery = null;
  }

  return gallery;
};
exports.getTotalGalleries = async (data) => {
  const { q } = data;

  let sql = `SELECT COUNT(*) AS total FROM gallery g
  LEFT JOIN gallery_description gd ON(g.gallery_id = gd.gallery_id)
  WHERE gd.language = '${reqLanguage}' AND gd.title LIKE '%${q}%'`;

  const [totals, fields] = await db.query(sql);
  const { total } = totals[0];
  return total;
};
exports.addGallery = withTransaction(async (transaction, body) => {
  const [gallery, _] = await transaction.query(`INSERT INTO gallery SET ?`, {
    status: body.status,
  });

  for (const desc of body.description) {
    await transaction.query(`INSERT INTO gallery_description SET ?`, {
      gallery_id: gallery.insertId,
      ...desc,
    });
  }

  const images = body.images.map((m) => [gallery.insertId, m.media_id]);
  let sql = ` INSERT INTO gallery_media (gallery_id, media_id) VALUES ?`;
  await transaction.query(sql, [images]);

  await transaction.commit();
  return this.getGallery(gallery.insertId);
});

exports.updateGallery = withTransaction(async (transaction, data) => {
  const { id } = data;
  const [gallery, _] = await transaction.query(
    `UPDATE gallery SET ? WHERE gallery_id = '${id}'`,
    {
      status: data.status,
    }
  );

  if (!gallery.affectedRows) {
    throw new ErrorResponse(404, i18next.t("common:not_found", { id: id }));
  }

  for (const desc of data.description) {
    await transaction.query(`REPLACE INTO gallery_description SET ? `, {
      gallery_id: id,
      ...desc,
    });
  }
  //Media
  await transaction.query(
    `DELETE FROM gallery_media WHERE gallery_id = '${id}'`
  );
  const value = data.images.map((m) => [id, m.media_id]);
  let sql = `INSERT INTO gallery_media (gallery_id, media_id) VALUES ? `;
  await transaction.query(sql, [value]);

  await transaction.commit();

  return this.getGallery(id);
});
exports.deleteGallery = async (gallery_id) => {
  const [gallery, _s] = await db.query(
    `DELETE FROM gallery WHERE gallery_id = '${gallery_id}'`
  );

  if (!gallery.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: gallery_id })
    );
  }

  return +gallery_id;
};
exports.switchGalleryStatus = async (gallery_id, status) => {
  await db.query(`UPDATE gallery SET ? WHERE gallery_id = '${gallery_id}'`, {
    status: status || 1,
  });

  return status;
};

exports.dirExists = async (path) => {
  return new Promise((resolve, reject) => {
    return fs.access(path, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });
};

exports.resizeUploadedImages = async (fullpath, withoutExt, ext) => {
  const fPath = syspath.join(__rootpath, fullpath);
  const tPath = syspath.join(__rootpath, withoutExt);
  const promises = [{ url: fullpath, code: "original" }];
  const { width, height } = await new Promise((resolve, reject) => {
    return iMagic(fPath).size(function (err, value) {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
  if (width > 800) {
    promises.push(
      new Promise((resolve, reject) => {
        return iMagic(fPath)
          .resize(800)
          .write(`${tPath}_large${ext}`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({ url: `${withoutExt}_large${ext}`, code: "large" });
            }
          });
      })
    );
  }
  if (width > 600) {
    promises.push(
      new Promise((resolve, reject) => {
        return iMagic(fPath)
          .resize(600)
          .write(`${tPath}_medium${ext}`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({ url: `${withoutExt}_medium${ext}`, code: "medium" });
            }
          });
      })
    );
    promises.push(
      new Promise((resolve, reject) => {
        return iMagic(fPath)
          .resize(600, 600, "!")
          .write(`${tPath}_600x600${ext}`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({ url: `${withoutExt}_600x600${ext}`, code: "600x600" });
            }
          });
      })
    );
  }
  if (width > 300) {
    promises.push(
      new Promise((resolve, reject) => {
        return iMagic(fPath)
          .resize(300, 300, "!")
          .write(`${tPath}_300x300${ext}`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({ url: `${withoutExt}_300x300${ext}`, code: "300x300" });
            }
          });
      })
    );
  }
  promises.push(
    new Promise((resolve, reject) => {
      return iMagic(fPath)
        .resize(150, 150, "!")
        .write(`${tPath}_150x150${ext}`, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ url: `${withoutExt}_150x150${ext}`, code: "thumbnail" });
          }
        });
    })
  );
  return Promise.all(promises);
};
exports.convertToWebP = async (pathes = []) => {
  let promises = [];
  for (const path of pathes) {
    const { dir, name, ext } = syspath.parse(path.url);
    const fPath = syspath.join(__rootpath, dir, name);
    promises.push(
      new Promise((resolve, reject) => {
        return iMagic(fPath + ext)
          .setFormat("webp")
          .write(`${fPath}.webp`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                url: `${syspath.join(dir, name)}.webp`,
                code: "webp_" + path.code,
              });
            }
          });
      })
    );
  }
  return Promise.all(promises);
};

exports.getMediaDimension = async (path) => {
  return new Promise((resolve, reject) => {
    return iMagic(path).size(function (err, value) {
      resolve(value);
    });
  });
};
exports.getMediaFileSize = async (path) => {
  const _path = __rootpath + path;
  const filesize = await fsPromise.stat(_path);
  let size = filesize.size;
  let KB = (size / 1024).toFixed(2);
  let MB = (size / (1024 * 1024)).toFixed(2);

  if (KB > 1000) {
    return MB + "MB";
  } else {
    return KB + "KB";
  }
};
exports.isImage = (file, ext) => {
  // Perhaps consider using a lib like mmmagic/magic numbers etx...
  let _ext;
  if (file) {
    _ext = syspath.parse(file.url || file.path || "").ext;
  } else if (ext) {
    _ext = ext;
  }
  return CONSTANTS.imageMime.includes(_ext.toLowerCase());
};
