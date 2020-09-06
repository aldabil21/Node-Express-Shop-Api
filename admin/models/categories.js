const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");
const i18next = require("../../i18next");

exports.getParentCategories = async (data) => {
  const { q, page, perPage, sort, direction, expand } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;

  let sql = `SELECT c.category_id, c.image, c.parent_id, c.sort_order, c.status, cd.title,
            cd.description, cd.meta_title, cd.meta_description, cd.meta_keyword
            from category c 
            LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
            WHERE c.parent_id ='0' AND cd.language = '${reqLanguage}' AND cd.title LIKE '%${q}%'
            ORDER BY c.${sort} ${direction}`;

  if (expand) {
    //Add limit & pagination only in expand mode
    sql += ` LIMIT ${_start}, ${_limit}`;
  }

  const [categories, fields] = await db.query(sql);

  return categories;
};

exports.getChildCategories = async (parent_id) => {
  let sql = `SELECT c.category_id, c.image, c.parent_id, c.sort_order, c.status, cd.title,
  cd.description, cd.meta_title, cd.meta_description, cd.meta_keyword
  from category c
  LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
  WHERE c.parent_id ='${parent_id}' AND cd.language = '${reqLanguage}'
  `;
  const [categories, fields] = await db.query(sql);

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
  let sql = `SELECT c.category_id, c.image, c.parent_id, c.sort_order, c.status, cd.title,
  cd.description, cd.meta_title, cd.meta_description, cd.meta_keyword
  FROM category c
  LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
  WHERE c.category_id ='${category_id}' AND cd.language = '${reqLanguage}'
  `;
  const [category, fields] = await db.query(sql);

  if (category.length && withChildren) {
    this.getChildCategories(category.category_id);
  }

  return category[0];
};

exports.addCategory = withTransaction(async (transaction, body) => {
  const description = [...body.description];
  delete body.description;

  const [category, _] = await transaction.query(`INSERT INTO category SET ?`, {
    ...body,
  });

  if (description) {
    for (const desc of description) {
      await transaction.query(`INSERT INTO category_description SET ?`, {
        category_id: category.insertId,
        ...desc,
      });
    }
  }
  await transaction.commit();

  return this.getCategory(category.insertId);
});

exports.updateCategory = withTransaction(async (transaction, data) => {
  const description = [...data.description];
  const category_id = data.id;
  delete data.description;
  delete data.id;

  const [category, _] = await transaction.query(
    `UPDATE category SET ? WHERE category_id = '${category_id}'`,
    {
      ...data,
      date_modified: new Date(),
    }
  );

  if (!category.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: category_id })
    );
  }

  if (description) {
    for (const desc of description) {
      await transaction.query(
        `UPDATE category_description SET ? WHERE category_id = '${category_id}' AND language = '${desc.language}'`,
        desc
      );
    }
  }

  await transaction.commit();

  return this.getCategory(category_id);
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

  let sql = `SELECT c.category_id, c.image, c.parent_id, c.sort_order, c.status, cd.title, dparent.title AS parent
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

exports.isIncludingProducts = async (prodIds = []) => {
  const ids = [0, ...prodIds];
  const [categories, fields] = await db.query(`
    SELECT DISTINCT category_id FROM product_category WHERE product_id IN (${ids})
  `);
  // console.log(prodIds);
  //Note: dont need to ckeck cat status, already was checked with getCheckout()
  return categories.map((cat) => cat.category_id);
};
