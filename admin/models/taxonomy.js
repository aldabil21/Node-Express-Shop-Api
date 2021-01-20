const Media = require("./media");
const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

exports.getParentTaxonomies = async (data) => {
  const { type, q, page, perPage, sort_order, direction, expand } = data;
  const start = (page - 1) * perPage;

  let sql = `SELECT t.taxonomy_id, t.media_id, t.parent_id, t.sort_order, t.status, td.title,
            td.description, td.meta_title, td.meta_description, td.meta_keywords
            FROM taxonomy t 
            LEFT JOIN taxonomy_description td ON(t.taxonomy_id = td.taxonomy_id)
            WHERE t.type='${type}' AND t.parent_id ='0'
            AND td.language = '${reqLanguage}' AND td.title LIKE '%${q}%'
            `;

  let sorter = "t";
  if (sort_order === "title") {
    sorter = "td";
  }
  sql += ` ORDER BY ${sorter}.${sort_order} ${direction}`;

  if (!!expand) {
    //Add limit & pagination only in expand mode
    sql += ` LIMIT ${start}, ${perPage}`;
  }
  const [taxonomies, fields] = await db.query(sql);

  for (const _taxo of taxonomies) {
    _taxo.image = await Media.getMediaById(_taxo.media_id);
  }

  return taxonomies;
};

exports.getChildTaxonomies = async (parent_id, type) => {
  let sql = `SELECT t.taxonomy_id,t.media_id, t.parent_id, t.sort_order, t.status, td.title,
  td.description, td.meta_title, td.meta_description, td.meta_keywords
  FROM taxonomy t
  LEFT JOIN taxonomy_description td ON(t.taxonomy_id = td.taxonomy_id)
  WHERE t.type='${type}' AND t.parent_id ='${parent_id}' AND td.language = '${reqLanguage}'
  `;
  const [taxonomies, fields] = await db.query(sql);
  for (const _taxo of taxonomies) {
    _taxo.image = await Media.getMediaById(_taxo.media_id);
  }
  return taxonomies;
};

exports.getTotalTaxonomies = async (data) => {
  const { type, q } = data;

  let sql = `SELECT COUNT(*) AS total FROM taxonomy t
  LEFT JOIN taxonomy_description td ON(t.taxonomy_id = td.taxonomy_id)
  WHERE t.type='${type}' AND t.parent_id ='0' AND td.language = '${reqLanguage}' AND td.title LIKE '%${q}%'
  `;

  const [totals, fields] = await db.query(sql);
  const { total } = totals[0];
  return total;
};

exports.getTaxonomy = async (taxonomy_id, withChildren = true) => {
  let sql = `SELECT t.taxonomy_id, t.media_id, t.parent_id, t.sort_order, t.status, td.title,
  td.description, td.meta_title, td.meta_description, td.meta_keywords
  FROM taxonomy t
  LEFT JOIN taxonomy_description td ON(t.taxonomy_id = td.taxonomy_id)
  WHERE t.taxonomy_id ='${taxonomy_id}' AND td.language = '${reqLanguage}'
  `;
  const [taxonomy, fields] = await db.query(sql);

  let _taxo = null;
  if (taxonomy.length) {
    _taxo = taxonomy[0];
    _taxo.image = await Media.getMediaById(_taxo.media_id);
    if (withChildren) {
      // this.getChildTaxonomies(taxonomy.taxonomy_id);
    }
  }
  return _taxo;
};

exports.getTaxonomyForEdit = async (taxonomy_id) => {
  let sql = `SELECT t.taxonomy_id, t.media_id, t.parent_id, t.sort_order, t.status,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      JSON_OBJECT("language", td.language, "title", td.title, "description", td.description, "meta_title", td.meta_title, "meta_description", td.meta_description, "meta_keywords", td.meta_keywords)
      )
  ,']'
  )
  AS description
  FROM taxonomy t
  LEFT JOIN taxonomy_description td ON(t.taxonomy_id = td.taxonomy_id)
  WHERE t.taxonomy_id ='${taxonomy_id}'
  `;

  const [taxonomy, fields] = await db.query(sql);

  let result = taxonomy[0];
  if (result && result.taxonomy_id) {
    result.description = JSON.parse(result.description);
    result.image = await Media.getMediaById(result.media_id);
  } else {
    result = null;
  }

  return result;
};

exports.addTaxonomy = withTransaction(async (transaction, body) => {
  const [taxonomy, _] = await transaction.query(`INSERT INTO taxonomy SET ?`, {
    parent_id: body.parent_id,
    media_id: body.image,
    type: body.type,
    sort_order: body.sort_order,
    status: body.status,
  });
  for (const desc of body.description) {
    await transaction.query(`INSERT INTO taxonomy_description SET ?`, {
      taxonomy_id: taxonomy.insertId,
      ...desc,
    });
  }

  await transaction.commit();

  return this.getTaxonomy(taxonomy.insertId);
});

exports.updateTaxonomy = withTransaction(async (transaction, data) => {
  const [taxonomy, _] = await transaction.query(
    `UPDATE taxonomy SET ? WHERE taxonomy_id = '${data.id}'`,
    {
      parent_id: data.parent_id,
      media_id: data.image || 0,
      sort_order: data.sort_order,
      status: data.status,
      //date_modified: new Date(),
    }
  );

  if (!taxonomy.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: data.id })
    );
  }

  for (const desc of data.description) {
    await transaction.query(`REPLACE INTO taxonomy_description SET ? `, {
      taxonomy_id: data.id,
      language: desc.language,
      ...desc,
    });
  }

  await transaction.commit();

  return this.getTaxonomy(data.id);
});

exports.deleteTaxonomy = async (taxonomy_id) => {
  const [taxonomy, _s] = await db.query(
    `DELETE FROM taxonomy WHERE taxonomy_id = '${taxonomy_id}'`
  );

  if (!taxonomy.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: taxonomy_id })
    );
  }
  const [children, _c] = await db.query(
    `DELETE FROM taxonomy WHERE parent_id = '${taxonomy_id}'`
  );

  return +taxonomy_id;
};

exports.getAllRaw = async (data) => {
  const { type, q = "" } = data;

  let sql = `SELECT t.taxonomy_id AS id, t.media_id, t.parent_id, t.sort_order, t.status, td.title, dparent.title AS parent
  FROM taxonomy t 
  LEFT JOIN taxonomy_description td ON(t.taxonomy_id = td.taxonomy_id)
  LEFT JOIN taxonomy tparent ON(tparent.taxonomy_id = t.parent_id)
  LEFT JOIN taxonomy_description dparent ON(tparent.taxonomy_id = dparent.taxonomy_id AND dparent.language = '${reqLanguage}')
  WHERE t.type = '${type}' AND td.language = '${reqLanguage}' AND td.title LIKE '%${q}%'
  ORDER BY CASE WHEN t.parent_id = 0 THEN t.taxonomy_id ELSE t.parent_id END, t.parent_id, t.taxonomy_id`;

  const [taxonomies, _c] = await db.query(sql);

  const divider = ">";
  for (const cat of taxonomies) {
    if (cat.parent) {
      cat.title = `${cat.parent} ${divider} ${cat.title}`;
    }
  }

  return taxonomies;
};

exports.switchStatus = async (taxonomy_id, status) => {
  await db.query(`UPDATE taxonomy SET ? WHERE taxonomy_id = '${taxonomy_id}'`, {
    status: status,
  });

  return status;
};

exports.isIncludingProducts = async (prodIds = []) => {
  const ids = [0, ...prodIds];
  const [taxonomies, fields] = await db.query(`
    SELECT DISTINCT taxonomy_id FROM product_taxonomy WHERE product_id IN (${ids})
  `);
  // console.log(prodIds);
  //Note: dont need to ckeck cat status, already was checked with getCheckout()
  return taxonomies.map((cat) => cat.taxonomy_id);
};
