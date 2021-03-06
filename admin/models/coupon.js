const db = require("../../config/db");
const withTransaction = require("../../helpers/withTransaction");
const ErrorResponse = require("../../helpers/error");
const { i18next } = require("../../i18next");

exports.getCoupons = async (data) => {
  const { q, page, perPage, sort, direction } = data;
  const _start = (page - 1) * perPage;

  let sql = `SELECT *, (SELECT COUNT(*) FROM coupon_history WHERE coupon_id = c.coupon_id) AS used
  FROM coupon c
  WHERE CONCAT_WS(c.title, c.code, c.amount) LIKE '%${q}%'
  ORDER BY c.${sort} ${direction} LIMIT ${_start}, ${perPage}`;

  const [coupons, fields] = await db.query(sql);
  return coupons;
};

exports.getTotalCoupons = async (data) => {
  const { q } = data;

  let sql = `SELECT COUNT(*) AS total from coupon c
  WHERE CONCAT_WS(c.title, c.code, c.amount) LIKE '%${q}%'`;

  const [totals, fields] = await db.query(sql);
  const { total } = totals[0];

  return total;
};

exports.getCoupon = async (coupon_id = 0, code) => {
  let sql = `
  SELECT c.*,
  CONCAT(
  '[',
  GROUP_CONCAT(
    DISTINCT
    CASE WHEN pd.product_id IS NOT NULL THEN
    JSON_OBJECT("id", pd.product_id, "title", pd.title)
    END
      )
  ,']'
  )
  AS products,
  CONCAT(
    '[',
      GROUP_CONCAT(
      DISTINCT
      CASE WHEN td.taxonomy_id IS NOT NULL AND t.type = 'product_category' THEN
      JSON_OBJECT("id", td.taxonomy_id, "title", td.title)
      END
      )
    ,']'
    )
  AS categories
  FROM coupon c
  LEFT JOIN coupon_product cp ON(cp.coupon_id = c.coupon_id)
  LEFT JOIN product_description pd ON(cp.product_id = pd.product_id AND pd.language = '${reqLanguage}')
  LEFT JOIN coupon_category cc ON(cc.coupon_id = c.coupon_id)
  LEFT JOIN taxonomy_description td ON(cc.taxonomy_id = td.taxonomy_id AND td.language = '${reqLanguage}')
  LEFT JOIN taxonomy t ON(td.taxonomy_id = t.taxonomy_id)
  `;

  if (code) {
    const couponCode = code.trim();
    //Validation purpose
    sql += ` WHERE c.code = '${couponCode}' AND c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW()`;
  } else {
    //Admin view/edit purpose
    sql += ` WHERE c.coupon_id = '${coupon_id}' `;
  }

  let coupon;

  const [query, fields] = await db.query(sql);

  if (query.length && query[0].coupon_id) {
    coupon = query[0];
    coupon.products = JSON.parse(coupon.products) || [];
    coupon.categories = JSON.parse(coupon.categories) || [];
  }

  return coupon;
};

exports.addCoupon = withTransaction(async (transaction, body) => {
  const products = [...body.products];
  const categories = [...body.categories];
  delete body.products;
  delete body.categories;

  const [coupon, _] = await transaction.query(`INSERT INTO coupon SET ?`, {
    ...body,
  });

  if (products.length) {
    for (const prod of products) {
      await transaction.query(`INSERT INTO coupon_product SET ?`, {
        coupon_id: coupon.insertId,
        product_id: prod,
      });
    }
  }
  if (categories.length) {
    for (const cat of categories) {
      await transaction.query(`INSERT INTO coupon_category SET ?`, {
        coupon_id: coupon.insertId,
        taxonomy_id: cat,
      });
    }
  }

  await transaction.commit();

  return this.getCoupon(coupon.insertId);
});

exports.updateCoupon = withTransaction(async (transaction, data) => {
  const products = [...data.products];
  const categories = [...data.categories];
  const coupon_id = data.id;
  delete data.products;
  delete data.categories;
  delete data.id;

  const [coupon, _] = await transaction.query(
    `UPDATE coupon SET ? WHERE coupon_id = '${coupon_id}'`,
    {
      ...data,
      date_modified: new Date(),
    }
  );

  if (!coupon.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: coupon_id })
    );
  }

  await transaction.query(
    `DELETE from coupon_product WHERE coupon_id = ${coupon_id}`
  );
  for (const prodId of products) {
    await transaction.query("INSERT INTO coupon_product SET ?", {
      coupon_id,
      product_id: prodId,
    });
  }

  await transaction.query(
    `DELETE from coupon_category WHERE coupon_id = ${coupon_id}`
  );
  for (const catId of categories) {
    await transaction.query("INSERT INTO coupon_category SET ?", {
      coupon_id,
      taxonomy_id: catId,
    });
  }

  await transaction.commit();

  return this.getCoupon(coupon_id);
});

exports.deleteCoupon = async (coupon_id) => {
  const [coupon, _s] = await db.query(
    `DELETE FROM coupon WHERE coupon_id = '${coupon_id}'`
  );

  if (!coupon.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: coupon_id })
    );
  }

  return +coupon_id;
};

exports.switchStatus = async (coupon_id, status) => {
  await db.query(`UPDATE coupon SET ? WHERE coupon_id = '${coupon_id}'`, {
    status: status,
  });

  return status;
};
