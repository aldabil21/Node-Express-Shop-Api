const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");
const syspath = require("path");
const { getMediaUrlById } = require("../../models/media");

exports.saveMedia = async (file, uploaded_by, req) => {
  const { path, mimetype } = file;
  const { name, ext } = syspath.parse(path);
  let url = "/" + path;
  const [result, _] = await db.query(`INSERT INTO media SET ?`, {
    title: name,
    url,
    uploaded_by,
  });

  if (!result.insertId) {
    url = null;
  }

  return {
    isDir: false,
    ext: ext,
    title: name,
    path: staticHost + url,
    media_id: result.insertId,
    isImg: isImage(null, ext),
  };
};
exports.getMediaByUrl = async (url, isFullUrl) => {
  let __url = url;
  let noPhoto = {
    // media_id: "0",
    isDir: false,
    ext: ".png",
    path: staticHost + "/media/no_photo.png",
    isImg: true,
    title: "MISSING PHOTO",
  };
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
    file.isImg = isImage(file);
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
  WHERE m.media_id = '${media_id}' 
  `;
  const [result, _] = await db.query(sql);

  let file;
  if (result.length && result[0].media_id) {
    file = result[0];
    const parse = syspath.parse(file.path);
    file.isImg = isImage(file);
    file.isDir = false;
    file.ext = parse.ext;
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
exports.deleteMedia = async (mediaId) => {
  const [media, __] = await db.query(
    `SELECT url FROM media WHERE media_id = '${mediaId}'`
  );
  const [result, _] = await db.query(
    `DELETE FROM media WHERE media_id = '${mediaId}'`
  );
  return media[0];
};
exports.deleteNestedMedia = async (path) => {
  let sql = `DELETE FROM media WHERE url LIKE '${path}%'`;
  await db.query(sql);
};
exports.getMediaUrlById = async (id) => {
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
      const _img = await getMediaUrlById(img);
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
      const _img = await getMediaUrlById(img);
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

const isImage = (file, ext) => {
  // Perhaps consider using a lib like mmmagic/magic numbers etx...
  let _ext;
  if (file) {
    ext = syspath.parse(file.url || file.path || "").ext;
  } else if (ext) {
    _ext = ext;
  }
  const mt = [".png", ".gif", ".jpg", ".jpeg", ".bmp", ".webp"];
  return mt.includes(ext);
};
