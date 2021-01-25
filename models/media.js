const syspath = require("path");
const db = require("../config/db");
const { CONSTANTS } = require("../helpers/constants");

exports.getAlbumById = async (query) => {
  const { id, category, tag, page, perPage, sort, direction, q } = query;
  const start = (page - 1) * perPage;
  let sql = `
  SELECT gd.title, gd.description
  FROM gallery g
  LEFT JOIN gallery_description gd ON(gd.gallery_id = g.gallery_id AND gd.language = '${reqLanguage}')
  WHERE g.gallery_id = '${id}' AND g.status = '1'
  `;
  const [album, _] = await db.query(sql);

  let result;
  if (album.length) {
    sql = `
    SELECT DISTINCT gm.media_id
    FROM gallery_media gm
    LEFT JOIN media m ON(m.media_id = gm.media_id)
    `;

    if (category.length || tag.length) {
      sql += `
      LEFT JOIN taxonomy_relationship tr ON(tr.object_id = gm.media_id)
      LEFT JOIN taxonomy_description td ON(td.taxonomy_id = tr.taxonomy_id AND td.language = '${reqLanguage}')
      LEFT JOIN taxonomy t ON(t.taxonomy_id = tr.taxonomy_id)
      WHERE t.taxonomy_id IN (${[...category, ...tag]}) AND t.status = '1'
      `;
    }
    const op = category.length || tag.length ? "AND" : "WHERE";
    sql += ` ${op} gm.gallery_id = ${id} `;
    if (q) {
      sql += ` AND CONCAT_WS(m.title, m.url) LIKE '%${q}%'`;
    }
    sql += ` LIMIT ${start}, ${perPage}`;
    const [medias, __] = await db.query(sql);
    result = album[0];
    let images = [];
    for (const media of medias) {
      const img = await this.getMediaById(media.media_id, "300x300");
      images.push(img);
    }
    result.images = images;
  }

  return result;
};

exports.getAlbumTotalImagesCount = async (query) => {
  const { id, category, tag, q } = query;
  let sql = `
  SELECT COUNT(*) AS total
  FROM gallery_media gm
  LEFT JOIN media m ON(m.media_id = gm.media_id)
  `;

  if (category.length || tag.length) {
    sql += `
    LEFT JOIN taxonomy_relationship tr ON(tr.object_id = gm.media_id)
    LEFT JOIN taxonomy_description td ON(td.taxonomy_id = tr.taxonomy_id AND td.language = '${reqLanguage}')
    LEFT JOIN taxonomy t ON(t.taxonomy_id = tr.taxonomy_id)
    WHERE t.taxonomy_id IN (${[...category, ...tag]}) AND t.status = '1'
    `;
  }
  const op = category.length || tag.length ? "AND" : "WHERE";
  sql += `
    ${op} gm.gallery_id = ${id}
  `;
  if (q) {
    sql += ` AND CONCAT_WS(m.title, m.url) LIKE '%${q}%'`;
  }
  const [result, __] = await db.query(sql);
  const { total } = result[0];
  return total;
};
exports.getMediaById = async (id, size = "thumbnail", withTaxo) => {
  const noPhoto = this.getEmptyMedia();
  if (!id) {
    return noPhoto;
  }
  let sql = `
  SELECT DISTINCT m.media_id, m.title, m.mimetype, m.is_image AS isImg,
  `;
  if (withTaxo) {
    sql += `
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
    ) AS tags,
    `;
  }

  sql += `
  CASE WHEN m.is_image THEN
    (SELECT CONCAT('${staticHost}', url) FROM media_variation WHERE media_id = m.media_id AND code = '${size}')
    ELSE
    CONCAT('${staticHost}', m.url)
  END AS path,
  CASE WHEN m.is_image THEN
    (SELECT CONCAT('${staticHost}', url) FROM media_variation WHERE media_id = m.media_id AND code = 'webp_${size}')
  END AS webpPath
  FROM media m
  LEFT JOIN taxonomy_relationship tr ON(tr.object_id = m.media_id)
  LEFT JOIN taxonomy_description td ON(tr.taxonomy_id = td.taxonomy_id AND td.language = '${reqLanguage}')
  LEFT JOIN taxonomy t ON(t.taxonomy_id = tr.taxonomy_id)
  WHERE m.media_id = '${id}'
  `;
  const [result, _] = await db.query(sql);
  let media;
  if (result.length) {
    media = result[0];
    if (!media.path) {
      return noPhoto;
    }
    const parse = syspath.parse(media.path);
    media.isDir = false;
    media.ext = parse.ext;
    if (withTaxo) {
      media.categories = JSON.parse(media.categories) || [];
      media.tags = JSON.parse(media.tags) || [];
    }
    return media;
  } else {
    return noPhoto;
  }
};

exports.getGalleryTaxonomies = async (query) => {
  const { gallery_id, numbers, type = "" } = query;

  let sql = `
  SELECT DISTINCT t.taxonomy_id, td.title
  `;
  if (numbers) {
    sql += `
    , (SELECT COUNT(*) FROM taxonomy_relationship trr
      LEFT JOIN gallery_media gmm ON(gmm.media_id = trr.object_id)
      WHERE gmm.gallery_id = '${gallery_id}' AND t.taxonomy_id = trr.taxonomy_id
      ) AS total
    `;
  }
  sql += `
  FROM gallery_media gm 
  LEFT JOIN taxonomy_relationship tr ON(tr.object_id = gm.media_id)
  LEFT JOIN taxonomy t ON(t.taxonomy_id = tr.taxonomy_id)
  LEFT JOIN taxonomy_description td ON(t.taxonomy_id = td.taxonomy_id AND td.language = '${reqLanguage}')
  WHERE gm.gallery_id = '${gallery_id}' AND t.type LIKE 'media_${type}%' AND t.status = '1' 
  `;
  const [result, _] = await db.query(sql);
  return result;
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
