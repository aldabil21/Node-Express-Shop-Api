const Settings = require("./settings");
const Tax = require("./tax");
const db = require("../config/db");
const { i18next } = require("../i18next");
const Media = require("./media");

const fullVer = [
  "categories",
  "filters",
  "options",
  "attributes",
  "wholesales",
];

exports.getProduct = async (product_id, includes = fullVer) => {
  let sql = `
  SELECT p.product_id, p.quantity, CAST(p.price AS DOUBLE)AS price,
  CASE WHEN ps.price IS NOT NULL THEN CAST(ps.price AS DOUBLE) ELSE 0 END AS special, p.points, p.tax_id,
  CASE WHEN t.value IS NOT NULL THEN CAST(t.value AS DOUBLE) ELSE 0 END AS tax_value,
  p.available_at, p.view, p.sold, p.weight, pd.title,
  pd.description, pd.tags, pd.meta_title, pd.meta_description, pd.meta_keywords, p.minimum,
  CASE WHEN p.maximum IS NOT NULL THEN CAST(p.maximum AS INTEGER) ELSE 0 END AS maximum,
  c.code AS coupon_code, c.amount AS coupon_amount, c.type AS coupon_type FROM product p
  LEFT JOIN taxonomy_relationship tr ON(tr.object_id = p.product_id)
  LEFT JOIN taxonomy taxo ON(taxo.taxonomy_id = tr.taxonomy_id AND taxo.type = 'product_category')
  LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
  LEFT JOIN product_special ps ON(p.product_id = ps.product_id AND ps.deadline > NOW() AND ps.status = '1')
  LEFT JOIN tax t ON(p.tax_id = t.tax_id AND t.status = '1')
  LEFT JOIN coupon_product cp ON(cp.product_id = p.product_id)
  LEFT JOIN coupon_category cc ON(cc.taxonomy_id = taxo.taxonomy_id)
  LEFT JOIN coupon c ON((c.coupon_id = cp.coupon_id OR cc.coupon_id = c.coupon_id) AND c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW())
  WHERE p.product_id = '${product_id}' AND pd.language = '${reqLanguage}' AND p.status = '1' AND taxo.status = '1' ORDER BY ps.price, -c.amount
              `;

  const [product, _] = await db.query(sql);

  // if (!product.length) {
  //   throw new ErrorResponse(
  //     404,
  //     i18next.t("product:product_not_found", { product: product_id })
  //   );
  // }

  let result = product[0];

  if (result && result.product_id) {
    //images
    result.images = await this.getProductImages(result.product_id);

    //Tax
    const calculateTax =
      Settings.getSetting("config", "tax_status").tax_status === "1";
    if (calculateTax) {
      result.price = Tax.calculate(result.tax_value, result.price);
      result.special = Tax.calculate(result.tax_value, result.special);
    }

    //Currency
    const currConfig = Settings.getSetting("config", "currency").currency;
    const currency = i18next.t(`common:${currConfig}`);
    result.currency = currency || "";

    if (includes.includes("categories")) {
      //get categories
      const categories = await this.getProductCategories(result.product_id);
      result.categories = categories;
    }
    if (includes.includes("options")) {
      //Get options
      const options = await this.getProductOptions(result.product_id);
      if (calculateTax) {
        for (const op of options) {
          op.price = Tax.calculate(result.tax_value, op.price);
        }
      }
      result.options = options;
    }
    if (includes.includes("attributes")) {
      //Get attributes
      const attributes = await this.getProductAttributes(result.product_id);
      result.attributes = attributes;
    }
    if (includes.includes("wholesales")) {
      //get wholesale_prices
      const wholesales = await this.getProductWholesales(result.product_id);
      if (calculateTax) {
        for (const wholesale of wholesales) {
          wholesale.price = Tax.calculate(result.tax_value, wholesale.price);
        }
      }
      result.wholesales = wholesales;
    }
    if (includes.includes("filters")) {
      //get filters
      const filters = await this.getProductFilters(result.product_id);
      result.filters = filters;
    }

    //Coupon info
    let coupon = "";
    if (result.coupon_code) {
      let type = "%";
      if (result.coupon_type === "F") {
        type = currency;
      }
      coupon = `${i18next.t("common:discount")} ${
        result.coupon_amount
      }${type} - ${i18next.t("common:use_coupon")}: ${result.coupon_code} `;
    }
    result.coupon = coupon;
    delete result.coupon_code;
    delete result.coupon_amount;
    delete result.coupon_type;
  }

  return result;
};

exports.getProducts = async (filters) => {
  const {
    category,
    filter,
    special,
    page,
    perPage,
    sort,
    direction,
    q,
  } = filters;

  const _page = page > 0 ? page : 1;
  const _limit = perPage || 20;
  const _start = (_page - 1) * _limit;

  let sql = `
  SELECT p.product_id, p.quantity, p.price, MIN(ps.price) AS special, p.points, p.tax_id, p.available_at,
  p.view, p.sold, pd.title, pd.description, pd.tags, pd.meta_title, pd.meta_description, pd.meta_keywords, t.value AS tax_value,
  c.code AS coupon_code, c.amount AS coupon_amount, c.type AS coupon_type              
  FROM product p
  LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
  LEFT JOIN taxonomy_relationship tr ON(tr.object_id = p.product_id)
  LEFT JOIN taxonomy_description td ON(td.taxonomy_id = tr.taxonomy_id AND td.language = '${reqLanguage}')
  LEFT JOIN taxonomy taxo ON(taxo.taxonomy_id = td.taxonomy_id AND (taxo.type = 'product_category' OR taxo.type = 'product_filter'))
  LEFT JOIN product_special ps ON(p.product_id = ps.product_id AND ps.deadline > NOW() AND ps.status = '1' AND ps.price > 0)
  LEFT JOIN tax t ON(p.tax_id = t.tax_id AND t.status = '1')
  LEFT JOIN coupon_product cp ON(cp.product_id = p.product_id)
  LEFT JOIN coupon_category cc ON(cc.taxonomy_id = taxo.taxonomy_id AND taxo.type = 'product_category')
  LEFT JOIN coupon c ON((c.coupon_id = cp.coupon_id OR cc.coupon_id = c.coupon_id) AND c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW())
  `;
  sql += ` WHERE p.status = '1' AND pd.language = '${reqLanguage}' `;
  if (category) {
    i = 0;
    sql += ` AND (`;
    for (const __c of category.split(",")) {
      sql += ` ${i > 0 ? "OR" : ""} taxo.taxonomy_id = '${__c}'`;
      i++;
    }
    sql += ` AND taxo.type = 'product_category')`;
  }
  if (filter) {
    i = 0;
    let op = category ? "OR" : "AND";
    sql += ` ${op} (`;
    for (const __f of filter.split(",")) {
      sql += ` ${i > 0 ? "OR" : ""} taxo.taxonomy_id = '${__f}'`;
      i++;
    }
    sql += ` AND taxo.type = 'product_filter')`;
  }
  if (special) {
    sql += ` AND (ps.deadline > NOW() AND ps.status = '1' AND ps.price > 0 OR c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW())`;
  }

  if (q) {
    sql += ` AND CONCAT_WS(pd.title, pd.tags, p.product_id ) LIKE '%${q}%'`;
  }

  sql += ` GROUP BY p.product_id`;

  if (sort) {
    let selector = "p";
    if (sort === "title") {
      selector = "pd";
    }
    sql += ` ORDER BY ${selector}.${sort} ${direction}`;
  }

  sql += ` LIMIT ${_start}, ${_limit}`;

  const [results, _] = await db.query(sql);

  let products = [];
  if (results.length) {
    const calculateTax =
      Settings.getSetting("config", "tax_status").tax_status === "1";

    for (let product of results) {
      let price = product.price;
      let special = product.special;

      if (calculateTax) {
        price = Tax.calculate(product.tax_value, product.price);
        special =
          product.special && Tax.calculate(product.tax_value, product.special);
      }

      //get categories
      const categories = await this.getProductCategories(product.product_id);

      //get filters
      const filters = await this.getProductFilters(product.product_id);

      //images
      const images = await this.getProductImages(product.product_id);

      //Currency
      const currConfig = Settings.getSetting("config", "currency").currency;
      const currency = i18next.t(`common:${currConfig}`);

      //Coupon info
      let coupon = "";
      if (product.coupon_code) {
        let type = "%";
        if (product.coupon_type === "F") {
          type = currency;
        }
        coupon = `${i18next.t("common:discount")} ${
          product.coupon_amount
        }${type} - ${i18next.t("common:use_coupon")}: ${product.coupon_code} `;
      }

      products.push({
        product_id: product.product_id,
        quantity: product.quantity,
        price: +price,
        special: +special,
        images,
        currency: currency || "",
        coupon,
        points: product.points,
        available_at: product.available_at,
        view: product.view,
        sold: product.sold,
        title: product.title,
        categories,
        filters,
      });
    }
  }

  return products;
};

exports.getTotalProducts = async (filters) => {
  const { category, filter, special, q } = filters;

  let sql = `
  SELECT COUNT(DISTINCT p.product_id) as total FROM product p
  LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
  LEFT JOIN taxonomy_relationship tr ON(tr.object_id = p.product_id)
  LEFT JOIN taxonomy_description td ON(td.taxonomy_id = tr.taxonomy_id AND td.language = '${reqLanguage}')
  LEFT JOIN taxonomy taxo ON(taxo.taxonomy_id = td.taxonomy_id AND (taxo.type = 'product_category' OR taxo.type = 'product_filter'))
  LEFT JOIN product_special ps ON(p.product_id = ps.product_id AND ps.deadline > NOW() AND ps.status = '1' AND ps.price > 0)
  LEFT JOIN coupon_product cp ON(cp.product_id = p.product_id)
  LEFT JOIN coupon_category cc ON(cc.taxonomy_id = taxo.taxonomy_id AND taxo.type = 'product_category')
  LEFT JOIN coupon c ON((c.coupon_id = cp.coupon_id OR cc.coupon_id = c.coupon_id) AND c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW())
  `;

  sql += ` WHERE p.status = '1' AND pd.language = '${reqLanguage}'`;
  if (category) {
    i = 0;
    sql += ` AND (`;
    for (const __c of category.split(",")) {
      sql += ` ${i > 0 ? "OR" : ""} taxo.taxonomy_id = '${__c}'`;
      i++;
    }
    sql += ` AND taxo.type = 'product_category')`;
  }
  if (filter) {
    i = 0;
    let op = category ? "OR" : "AND";
    sql += ` ${op} (`;
    for (const __f of filter.split(",")) {
      sql += ` ${i > 0 ? "OR" : ""} taxo.taxonomy_id = '${__f}'`;
      i++;
    }
    sql += ` AND taxo.type = 'product_filter')`;
  }
  if (special) {
    sql += ` AND (ps.deadline > NOW() AND ps.status = '1' AND ps.price > 0 OR c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW())`;
  }

  if (q) {
    sql += ` AND CONCAT_WS(pd.title, pd.tags, p.product_id ) LIKE '%${q}%'`;
  }

  const [products, _] = await db.query(sql);
  const { total } = products[0];

  return total;
};

exports.findOne = async (product_id) => {
  const [query, fields] = await db.query(
    `SELECT DISTINCT * FROM product WHERE product_id = '${product_id}'`
  );

  let product;
  if (query.length) {
    product = query[0];
  }

  return product;
};

exports.getProductCategories = async (product_id) => {
  const [categories, fields] = await db.query(
    `SELECT t.taxonomy_id AS id, t.status, td.title, td.description FROM taxonomy_relationship tr
      LEFT JOIN taxonomy_description td ON(tr.taxonomy_id = td.taxonomy_id AND td.language = '${reqLanguage}')
      LEFT JOIN taxonomy t ON(t.taxonomy_id = td.taxonomy_id)
      WHERE tr.object_id = ${product_id} AND t.type = 'product_category'`
  );

  return categories;
};

exports.getProductOptions = async (product_id) => {
  let sql = `SELECT po.option_id, po.quantity, CAST(po.price AS DOUBLE) AS price, od.title
             FROM product_option po
             LEFT JOIN option_description od ON(po.option_id = od.option_id AND od.language = '${reqLanguage}')
             WHERE po.product_id = '${product_id}'`;

  const [options, fields] = await db.query(sql);

  return options;
};

exports.getProductAttributes = async (product_id) => {
  const [
    attributes,
    fields,
  ] = await db.query(`SELECT pa.attribute_id, pa.description, ad.title FROM product_attribute pa
                      LEFT JOIN attribute_description ad ON(ad.attribute_id = pa.attribute_id AND ad.language = '${reqLanguage}')
                      LEFT JOIN attribute aa ON(aa.attribute_id = pa.attribute_id)
                      WHERE pa.product_id = '${product_id}' AND pa.language = '${reqLanguage}' AND aa.status = '1'`);

  return attributes;
};

exports.getProductWholesales = async (product_id) => {
  const [wholesales, _w] = await db.query(
    `SELECT id, quantity, CAST(price AS DOUBLE) AS price FROM product_wholesale WHERE product_id = ${product_id} ORDER BY quantity`
  );

  return wholesales;
};

exports.getProductFilters = async (product_id) => {
  const [filters, fields] = await db.query(
    `SELECT t.taxonomy_id AS id, t.status, td.title, td.description FROM taxonomy_relationship tr
      LEFT JOIN taxonomy_description td ON(tr.taxonomy_id = td.taxonomy_id AND td.language = '${reqLanguage}')
      LEFT JOIN taxonomy t ON(t.taxonomy_id = td.taxonomy_id)
      WHERE tr.object_id = ${product_id} AND t.type = 'product_filter'`
  );

  return filters;
};
exports.getProductImages = async (product_id) => {
  const [images, fields] = await db.query(
    `SELECT media_id AS id  FROM product_media WHERE product_id = ${product_id}`
  );

  let _images = [
    {
      isDir: false,
      ext: ".png",
      path: staticHost + "/media/no_photo.png",
      isImg: true,
    },
  ];
  let idx = 0;
  for (const img of images) {
    _images[idx] = await Media.getMediaById(img.id);
    idx++;
  }
  return _images;
};
exports.addViewCount = (product_id, currentView) => {
  db.query(`UPDATE product SET ? WHERE product_id = '${product_id}'`, {
    view: ++currentView,
  });
};
