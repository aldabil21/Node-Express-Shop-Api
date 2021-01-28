const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");
const Media = require("../../models/media");

exports.getSheets = async () => {
  let sql = `
  SELECT s.sheet_id, s.media_id, s.status, sd.title,
  CONCAT(
    '[',
      GROUP_CONCAT(DISTINCT
        CASE WHEN sp.sheet_prop_id IS NOT NULL THEN
        JSON_OBJECT(
          "prop_id", sp.sheet_prop_id,
          "image", sp.media_id,
          "title", spd.title,
          "weight", sp.weight,
          "ton_price", sp.ton_price
          )
        END
        )
    ,']'
  ) AS properties
  FROM bp_sheets s
  LEFT JOIN bp_sheet_description sd ON(s.sheet_id = sd.sheet_id AND sd.language = '${reqLanguage}')
  LEFT JOIN bp_sheet_prop sp ON(s.sheet_id = sp.sheet_id)
  LEFT JOIN bp_sheet_prop_description spd ON(sp.sheet_prop_id = spd.sheet_prop_id AND spd.language = '${reqLanguage}')
  GROUP BY s.sheet_id
  ORDER BY s.sort_order
  `;

  const [sheets, _s] = await db.query(sql);

  for (const sheet of sheets) {
    sheet.properties = JSON.parse(sheet.properties) || [];
    sheet.image = await Media.getMediaById(sheet.media_id);
    for (const prop of sheet.properties) {
      prop.image = await Media.getMediaById(prop.media_id);
    }
  }
  return sheets;
};

exports.getSheetById = async (sheet_id) => {
  let sql = `
  SELECT s.sheet_id, s.media_id, s.status, sd.title,
  CONCAT(
    '[',
      GROUP_CONCAT(DISTINCT
        CASE WHEN sp.sheet_prop_id IS NOT NULL THEN
        JSON_OBJECT(
          "prop_id", sp.sheet_prop_id,
          "image", sp.media_id,
          "title", spd.title,
          "weight", sp.weight,
          "ton_price", sp.ton_price
          )
        END
        )
    ,']'
  ) AS properties
  FROM bp_sheets s
  LEFT JOIN bp_sheet_description sd ON(s.sheet_id = sd.sheet_id AND sd.language = '${reqLanguage}')
  LEFT JOIN bp_sheet_prop sp ON(s.sheet_id = sp.sheet_id)
  LEFT JOIN bp_sheet_prop_description spd ON(sp.sheet_prop_id = spd.sheet_prop_id AND spd.language = '${reqLanguage}')
  WHERE s.sheet_id = '${sheet_id}'
  `;

  const [query, _q] = await db.query(sql);

  let sheet;
  if (query.length && query[0].sheet_id) {
    sheet = query[0];
    sheet.properties = JSON.parse(sheet.properties) || [];
    sheet.image = await Media.getMediaById(sheet.media_id);
    for (const prop of sheet.properties) {
      prop.image = await Media.getMediaById(prop.media_id);
    }
  }
  return sheet;
};

exports.getSheetByIdForEdit = async (sheet_id) => {
  let sql = `
  SELECT s.sheet_id, s.media_id, s.status, sd.title, s.sort_order,
  CONCAT(
    '[',
      GROUP_CONCAT(DISTINCT
        JSON_OBJECT(
          "language", sd.language,
          "title", sd.title
          )
        )
    ,']'
  ) AS description,
  CONCAT(
    '[',
      GROUP_CONCAT(DISTINCT
        CASE WHEN sp.sheet_prop_id IS NOT NULL THEN
        JSON_OBJECT(
          "prop_id", sp.sheet_prop_id,
          "image", sp.media_id,
          "weight", sp.weight,
          "ton_price", sp.ton_price,
          "description", CONCAT(
              '[',
                  (SELECT GROUP_CONCAT(DISTINCT JSON_OBJECT("language",language, "title", title)) FROM bp_sheet_prop_description WHERE sheet_prop_id = sp.sheet_prop_id)
              ,']'
            )
          )
        END
        )
    ,']'
  ) AS properties
  FROM bp_sheets s
  LEFT JOIN bp_sheet_description sd ON(s.sheet_id = sd.sheet_id)
  LEFT JOIN bp_sheet_prop sp ON(s.sheet_id = sp.sheet_id)
  LEFT JOIN bp_sheet_prop_description spd ON(sp.sheet_prop_id = spd.sheet_prop_id)
  WHERE s.sheet_id = '${sheet_id}'
  `;

  const [query, _q] = await db.query(sql);

  let sheet;
  if (query.length && query[0].sheet_id) {
    sheet = query[0];
    sheet.properties = JSON.parse(sheet.properties) || [];
    sheet.description = JSON.parse(sheet.description) || [];
    sheet.image = await Media.getMediaById(sheet.media_id);
    for (const prop of sheet.properties) {
      prop.image = await Media.getMediaById(prop.image);
      prop.description = JSON.parse(prop.description) || [];
    }
  }
  return sheet;
};

exports.addSheet = withTransaction(async (transaction, body) => {
  const { image, status, sort_order, description, properties } = body;

  const [sheet, _s] = await transaction.query(`INSERT INTO bp_sheets SET ? `, {
    media_id: image,
    status,
    sort_order,
  });
  const _description = description.map((d) => [
    sheet.insertId,
    d.language,
    d.title,
  ]);
  const descSql = `INSERT INTO bp_sheet_description (sheet_id, language, title) VALUES ?`;
  const [desc, _d] = await transaction.query(descSql, [_description]);

  for (const prop of properties) {
    const [sheetProp, __sp] = await transaction.query(
      `INSERT INTO bp_sheet_prop SET ?`,
      {
        media_id: prop.image,
        sheet_id: sheet.insertId,
        weight: prop.weight,
        ton_price: prop.ton_price,
      }
    );

    for (const propDesc of prop.description) {
      await transaction.query(`INSERT INTO bp_sheet_prop_description SET ?`, {
        sheet_prop_id: sheetProp.insertId,
        language: propDesc.language,
        title: propDesc.title,
      });
    }
  }
  await transaction.commit();
  return this.getSheetById(sheet.insertId);
});
exports.updateSheet = withTransaction(async (transaction, body) => {
  const { id, image, status, sort_order, description, properties } = body;
  const [sheet, _s] = await transaction.query(
    `UPDATE bp_sheets SET ? WHERE sheet_id = ${id}`,
    {
      media_id: image,
      status,
      sort_order,
    }
  );

  if (!sheet.affectedRows) {
    throw new ErrorResponse(400, i18next("quotation:sheet_not_found", { id }));
  }

  const _description = description.map((d) => [id, d.language, d.title]);
  const descSql = `INSERT INTO bp_sheet_description (sheet_id, language, title) VALUES ? ON DUPLICATE KEY UPDATE title = VALUES(title)`;
  const [desc, _d] = await transaction.query(descSql, [_description]);

  await transaction.query(`DELETE FROM bp_sheet_prop WHERE sheet_id = ${id}`);
  for (const prop of properties) {
    const [sheetProp, __sp] = await transaction.query(
      `INSERT INTO bp_sheet_prop SET ?`,
      {
        sheet_id: id,
        media_id: prop.image,
        weight: prop.weight,
        ton_price: prop.ton_price,
      }
    );
    for (const propDesc of prop.description) {
      await transaction.query(`INSERT INTO bp_sheet_prop_description SET ?`, {
        sheet_prop_id: sheetProp.insertId,
        language: propDesc.language,
        title: propDesc.title,
      });
    }
  }
  await transaction.commit();
  return this.getSheetById(id);
});
exports.deleteSheet = async (sheet_id) => {
  const [sheet, _s] = await db.query(
    `DELETE FROM bp_sheets WHERE sheet_id = '${sheet_id}'`
  );

  if (!sheet.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: sheet_id })
    );
  }
  return +sheet_id;
};
exports.switchStatus = async (sheet_id, status) => {
  await db.query(`UPDATE bp_sheets SET ? WHERE sheet_id = '${sheet_id}'`, {
    status: status,
  });

  return status;
};
