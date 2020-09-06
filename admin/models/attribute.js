const db = require("../../config/db");

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
  const sorting = sort || "sort_order";

  let sql = `SELECT * FROM attribute a
  LEFT JOIN attribute_description ad ON(a.attribute_id = ad.attribute_id)
  WHERE ad.title LIKE '%${q}%' AND ad.language = '${reqLanguage}'
  ORDER BY a.${sorting} ${direction} LIMIT ${_start}, ${_limit}`;

  const [attributes, fields] = await db.query(sql);

  return attributes;
};
