const Checkout = require("./checkout");
const Taxonomy = require("./taxonomy");
const db = require("../config/db");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../i18next");

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
  WHERE c.code = '${code.trim()}' AND c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW()
  `;

  let coupon;

  const [query, fields] = await db.query(sql);

  if (query.length && query[0].coupon_id) {
    coupon = query[0];
    coupon.products = JSON.parse(coupon.products) || [];
    coupon.categories = JSON.parse(coupon.categories) || [];
  }

  return coupon;
};

exports.validate = async (data) => {
  const { code, user_id, order_id, orderProducts } = data;

  let valid = false;
  let message = i18next.t("cart:coupon_invalid_or_expired");

  //Check if exist
  const exist = await this.getCoupon(null, code);
  if (!exist) {
    return { valid, message };
  }

  //Check if within product/category
  message = i18next.t("cart:coupon_is_not_in_category_or_product", { code });
  let products = orderProducts || [];
  if (!products.length) {
    //Get checkout products if not passed
    products = await Checkout.getProducts(order_id);
  }
  //get array Ids products/categories
  const productIds = products.map((prod) => prod.product_id);
  const categoryIds = await Taxonomy.isIncludingProducts(productIds);

  for (const couponCats of exist.categories) {
    if (categoryIds.includes(couponCats.id)) {
      valid = true;
      break;
    }
  }

  if (!valid) {
    for (const couponProds of exist.products) {
      // console.log(couponProds.product_id);
      if (productIds.includes(couponProds.id)) {
        valid = true;
        break;
      }
    }
  }

  //Check if minTotal is enabled => validate
  if (valid && exist.min_total > 0) {
    const [bruttoQuery, _br] = await db.query(
      `SELECT value FROM order_totals WHERE code ='brutto' AND order_id = '${order_id}'`
    );
    const brutto = bruttoQuery.length ? +bruttoQuery[0].value : 0;
    if (exist.min_total > brutto) {
      valid = false;
      message = i18next.t("cart:order_total_must_gt_min", {
        min: exist.min_total,
      });
    }
  }

  //Check if total limit applied
  if (valid && exist.total_limit > 0) {
    const [query, fields] = await db.query(
      `SELECT COUNT(*) AS total from coupon_history WHERE coupon_id = '${exist.coupon_id}'`
    );
    if (query.length && query[0].total >= exist.total_limit) {
      valid = false;
      message = i18next.t("cart:all_coupons_been_used");
    }
  }

  //Check if user limit applied
  if (valid && exist.user_limit > 0) {
    const [query, fields] = await db.query(
      `SELECT COUNT(*) AS total from coupon_history WHERE coupon_id = '${exist.coupon_id}' AND user_id = '${user_id}'`
    );
    if (query.length && query[0].total >= exist.user_limit) {
      valid = false;
      message = i18next.t("cart:user_used_your_coupon_limit");
    }
  }

  return { valid, message, couponInfo: exist };
};

exports.addHistory = async (code, order_id, user_id, value) => {
  const couponCode = code ? code.trim() : "";

  const coupon = await this.getCoupon(null, couponCode);
  if (!coupon) {
    throw new ErrorResponse(400, i18next.t("cart:coupon_invalid_or_expired"));
  }
  const amountVal = value || 0;
  const amount = amountVal > 0 ? amountVal : amountVal * -1;

  const [history, _] = await db.query(`INSERT INTO coupon_history SET ?`, {
    coupon_id: coupon.coupon_id,
    order_id,
    user_id,
    amount,
  });

  let result = true;

  if (!history.affectedRows) {
    throw new ErrorResponse(500, i18next.t("cart:fail_add_coupon_history"));
  }

  return result;
};
