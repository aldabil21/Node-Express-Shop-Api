const Media = require("./media");
const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

exports.getParentCategories = async (data) => {
  const { q, page, perPage, sort, direction, expand } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;

  let sql = `SELECT c.category_id, c.media_id, c.parent_id, c.sort_order, c.status, cd.title,
            cd.description, cd.meta_title, cd.meta_description, cd.meta_keywords
            from category c 
            LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
            WHERE c.parent_id ='0' AND cd.language = '${reqLanguage}' AND cd.title LIKE '%${q}%'
            `;

  let sorter = "c";
  if (sort === "title") {
    sorter = "cd";
  }
  sql += ` ORDER BY ${sorter}.${sort} ${direction}`;

  if (expand) {
    //Add limit & pagination only in expand mode
    sql += ` LIMIT ${_start}, ${_limit}`;
  }

  const [categories, fields] = await db.query(sql);
  for (const _cat of categories) {
    _cat.image = await Media.getMediaById(_cat.media_id);
  }

  return categories;
};

exports.getChildCategories = async (parent_id) => {
  let sql = `SELECT c.category_id,c.media_id, c.parent_id, c.sort_order, c.status, cd.title,
  cd.description, cd.meta_title, cd.meta_description, cd.meta_keywords
  from category c
  LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
  WHERE c.parent_id ='${parent_id}' AND cd.language = '${reqLanguage}'
  `;
  const [categories, fields] = await db.query(sql);
  for (const _cat of categories) {
    _cat.image = await Media.getMediaById(_cat.media_id);
  }
  return categories;
};

exports.getTotalCategories = async (data) => {
  const { q } = data;

  let sql = `SELECT COUNT(*) AS total from category c
  LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
  WHERE c.parent_id ='0' AND cd.language = '${reqLanguage}' AND cd.title LIKE '%${q}%'
  `;

  const [totals, fields] = await db.query(sql);
  const { total } = totals[0];
  return total;
};

exports.getCategory = async (category_id, withChildren = true) => {
  let sql = `SELECT c.category_id, c.media_id, c.parent_id, c.sort_order, c.status, cd.title,
  cd.description, cd.meta_title, cd.meta_description, cd.meta_keywords
  FROM category c
  LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
  WHERE c.category_id ='${category_id}' AND cd.language = '${reqLanguage}'
  `;
  const [category, fields] = await db.query(sql);

  let _cat = null;
  if (category.length) {
    _cat = category[0];
    _cat.image = await Media.getMediaById(_cat.media_id);
    if (withChildren) {
      // this.getChildCategories(category.category_id);
    }
  }
  return _cat;
};

exports.getCategoryForEdit = async (category_id) => {
  let sql = `SELECT c.category_id, c.media_id, c.parent_id, c.sort_order, c.status,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      JSON_OBJECT("language", cd.language, "title", cd.title, "description", cd.description, "meta_title", cd.meta_title, "meta_description", cd.meta_description, "meta_keywords", cd.meta_keywords)
      )
  ,']'
  )
  AS description
  FROM category c
  LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
  WHERE c.category_id ='${category_id}'
  `;

  const [category, fields] = await db.query(sql);

  let result = category[0];
  if (result && result.category_id) {
    result.description = JSON.parse(result.description);
    result.image = await Media.getMediaById(result.media_id);
  } else {
    result = null;
  }

  return result;
};

exports.addCategory = withTransaction(async (transaction, body) => {
  const [category, _] = await transaction.query(`INSERT INTO category SET ?`, {
    parent_id: body.parent_id,
    media_id: body.image,
    sort_order: body.sort_order,
    status: body.status,
  });

  for (const desc of body.description) {
    await transaction.query(`INSERT INTO category_description SET ?`, {
      category_id: category.insertId,
      ...desc,
    });
  }

  await transaction.commit();

  return this.getCategory(category.insertId);
});

exports.updateCategory = withTransaction(async (transaction, data) => {
  const [category, _] = await transaction.query(
    `UPDATE category SET ? WHERE category_id = '${data.id}'`,
    {
      parent_id: data.parent_id,
      media_id: data.image || 0,
      sort_order: data.sort_order,
      status: data.status,
      date_modified: new Date(),
    }
  );

  if (!category.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: data.id })
    );
  }

  for (const desc of data.description) {
    await transaction.query(`REPLACE INTO category_description SET ? `, {
      category_id: data.id,
      language: desc.language,
      ...desc,
    });
  }

  await transaction.commit();

  return this.getCategory(data.id);
});

exports.deleteCategory = async (category_id) => {
  const [category, _s] = await db.query(
    `DELETE FROM category WHERE category_id = '${category_id}'`
  );

  if (!category.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: category_id })
    );
  }
  const [children, _c] = await db.query(
    `DELETE FROM category WHERE parent_id = '${category_id}'`
  );

  return +category_id;
};

exports.getAllRaw = async (q) => {
  const query = q || "";

  let sql = `SELECT c.category_id, c.media_id, c.parent_id, c.sort_order, c.status, cd.title, dparent.title AS parent
  FROM category c 
  LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
  LEFT JOIN category cparent ON(cparent.category_id = c.parent_id)
  LEFT JOIN category_description dparent ON(cparent.category_id = dparent.category_id AND dparent.language = '${reqLanguage}')
  WHERE cd.language = '${reqLanguage}' AND cd.title LIKE '%${query}%'
  ORDER BY CASE WHEN c.parent_id = 0 THEN c.category_id ELSE c.parent_id END, c.parent_id, c.category_id`;

  const [categories, _c] = await db.query(sql);

  const divider = ">";
  for (const cat of categories) {
    if (cat.parent) {
      cat.title = `${cat.parent} ${divider} ${cat.title}`;
    }
  }

  return categories;
};

exports.switchStatus = async (category_id, status) => {
  await db.query(`UPDATE category SET ? WHERE category_id = '${category_id}'`, {
    status: status,
  });

  return status;
};

exports.isIncludingProducts = async (prodIds = []) => {
  const ids = [0, ...prodIds];
  const [categories, fields] = await db.query(`
    SELECT DISTINCT category_id FROM product_category WHERE product_id IN (${ids})
  `);
  // console.log(prodIds);
  //Note: dont need to ckeck cat status, already was checked with getCheckout()
  return categories.map((cat) => cat.category_id);
};
