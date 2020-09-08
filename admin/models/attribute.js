const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const i18next = require("../../i18next");
const ErrorResponse = require("../helpers/error");

exports.autocomplete = async (q) => {
  const _limit = 20;

  let sql = `SELECT * FROM attribute a
  LEFT JOIN attribute_description ad ON(a.attribute_id = ad.attribute_id)
  WHERE ad.title LIKE '%${q}%' AND ad.language = '${reqLanguage}' AND a.status = '1'
  ORDER BY a.sort_order LIMIT 0, ${_limit}`;

  const [attributes, fields] = await db.query(sql);

  return attributes;
};

exports.getAttributes = async (data) => {
  const { q, page, perPage, sort, direction } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;
  const sorting = sort || "date_added";

  let sql = `SELECT * FROM attribute a
  LEFT JOIN attribute_description ad ON(a.attribute_id = ad.attribute_id)
  WHERE ad.language = '${reqLanguage}' AND ad.title LIKE '%${q}%'
  ORDER BY a.${sorting} ${direction} LIMIT ${_start}, ${_limit}`;

  const [attributes, fields] = await db.query(sql);

  return attributes;
};
exports.getTotalAttributes = async (data) => {
  const { q } = data;

  let sql = `SELECT COUNT(*) AS total FROM attribute a
  LEFT JOIN attribute_description ad ON(a.attribute_id = ad.attribute_id)
  WHERE ad.language = '${reqLanguage}' AND ad.title LIKE '%${q}%'`;

  const [totals, fields] = await db.query(sql);
  const { total } = totals[0];
  return total;
};

exports.getAttribute = async (attribute_id) => {
  let sql = `SELECT a.attribute_id, a.sort_order, a.status, ad.title
  FROM attribute a 
  LEFT JOIN attribute_description ad ON(a.attribute_id = ad.attribute_id)
  WHERE a.attribute_id ='${attribute_id}' AND ad.language = '${reqLanguage}'
  `;
  const [query, fields] = await db.query(sql);

  let attribute;
  if (query.length) {
    attribute = query[0];
  }

  return attribute;
};

exports.getAttributeForEdit = async (attribute_id) => {
  let sql = `SELECT a.attribute_id, a.sort_order, a.status,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      JSON_OBJECT("language", ad.language, "title", ad.title)
      )
  ,']'
  )
  AS description
  FROM attribute a
  LEFT JOIN attribute_description ad ON(a.attribute_id = ad.attribute_id)
  WHERE a.attribute_id ='${attribute_id}'
  `;

  const [attribute, fields] = await db.query(sql);

  let result = attribute[0];
  if (result && result.attribute_id) {
    result.description = JSON.parse(result.description);
  } else {
    result = null;
  }

  return result;
};

exports.addAttribute = withTransaction(async (transaction, body) => {
  const description = [...body.description];
  delete body.description;

  const [attribute, _] = await transaction.query(
    `INSERT INTO attribute SET ?`,
    {
      ...body,
    }
  );

  if (description) {
    for (const desc of description) {
      await transaction.query(`INSERT INTO attribute_description SET ?`, {
        attribute_id: attribute.insertId,
        ...desc,
      });
    }
  }
  await transaction.commit();
  return this.getAttribute(attribute.insertId);
});

exports.updateAttribute = withTransaction(async (transaction, data) => {
  const description = [...data.description];
  const attribute_id = data.id;
  delete data.description;
  delete data.id;

  const [attribute, _] = await transaction.query(
    `UPDATE attribute SET ? WHERE attribute_id = '${attribute_id}'`,
    {
      ...data,
      date_modified: new Date(),
    }
  );

  if (!attribute.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: attribute_id })
    );
  }

  if (description) {
    for (const desc of description) {
      await transaction.query(
        `UPDATE attribute_description SET ? WHERE attribute_id = '${attribute_id}' AND language = '${desc.language}'`,
        desc
      );
    }
  }

  await transaction.commit();

  return this.getAttribute(attribute_id);
});

exports.deleteAttribute = async (attribute_id) => {
  const [attribute, _s] = await db.query(
    `DELETE FROM attribute WHERE attribute_id = '${attribute_id}'`
  );

  if (!attribute.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: attribute_id })
    );
  }

  return +attribute_id;
};

exports.switchStatus = async (attribute_id, status) => {
  await db.query(
    `UPDATE attribute SET ? WHERE attribute_id = '${attribute_id}'`,
    {
      status: status,
    }
  );

  return status;
};
