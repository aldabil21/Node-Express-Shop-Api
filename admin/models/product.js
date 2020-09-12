const Settings = require("./settings");
const Tax = require("./tax");
const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");
const i18next = require("../../i18next");

const fullVer = [
  "categories",
  "filters",
  "options",
  "attributes",
  "wholesales",
];
const shortVer = ["categories", "filters"];

exports.getProduct = async (product_id, includes = fullVer) => {
  let sql = `
  SELECT p.*,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      JSON_OBJECT("language", pd.language, "title", pd.title, "description",pd.description, "tags", pd.tags, "meta_title", pd.meta_title, "meta_description", pd.meta_description, "meta_keywords", pd.meta_keywords)
      )
  ,']'
  )
  AS description,
  CONCAT(
  '[',
  GROUP_CONCAT(
    DISTINCT
      CASE WHEN pc.category_id IS NOT NULL THEN
      JSON_OBJECT("id", pc.category_id, "title", cd.title, "status",c.status)
      ELSE
      ""
      END
      )
  ,']'
  )
  AS categories,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      CASE WHEN pf.filter_id IS NOT NULL THEN
      JSON_OBJECT("id", pf.filter_id, "title", fd.title, "status",f.status)
      ELSE
      ""
      END
      )
  ,']'
  )
  AS filters,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      CASE WHEN po.option_id IS NOT NULL THEN
      JSON_OBJECT(
        "option_id", po.option_id,
        "quantity", po.quantity,
        "price", po.price,
        "description", CONCAT(
          '[',
          (SELECT GROUP_CONCAT(DISTINCT JSON_OBJECT("language",language, "title", title)) FROM option_description WHERE option_id = po.option_id)
          ,']'
          )
        )
        ELSE
        ""
        END
      )
  ,']'
  )
  AS options,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      CASE WHEN ad.attribute_id IS NOT NULL THEN
      JSON_OBJECT(
        "attribute", JSON_OBJECT("attribute_id", ad.attribute_id, "title", ad.title),
        "description", CONCAT(
          '[',
            (SELECT GROUP_CONCAT(DISTINCT JSON_OBJECT("language",language, "description", description)) AS a FROM product_attribute WHERE attribute_id = pa.attribute_id)
          ,']'
          )
        )
        ELSE
        ""
        END
      )
  ,']'
  )
  AS attributes,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      CASE WHEN pw.quantity IS NOT NULL THEN
      JSON_OBJECT(
        "quantity", pw.quantity,
        "price", pw.price
        )
        ELSE
        ""
        END
      )
  ,']'
  )
  AS wholesales
  FROM product p
  LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
  LEFT JOIN product_category pc ON(pc.product_id = p.product_id)
  LEFT JOIN category_description cd ON(pc.category_id = cd.category_id AND cd.language = '${reqLanguage}')
  LEFT JOIN category c ON(pc.category_id = c.category_id)
  LEFT JOIN product_filter pf ON(pf.product_id = p.product_id)
  LEFT JOIN filter_description fd ON(fd.filter_id = pf.filter_id AND fd.language = '${reqLanguage}')
  LEFT JOIN filter f ON(pf.filter_id = f.filter_id)
  LEFT JOIN product_option po ON(po.product_id = p.product_id)
  LEFT JOIN product_attribute pa ON(pa.product_id = p.product_id AND pa.language = '${reqLanguage}')
  LEFT JOIN attribute_description ad ON(ad.attribute_id = pa.attribute_id AND ad.language = '${reqLanguage}')
  LEFT JOIN product_wholesale pw ON(pw.product_id = p.product_id)
  WHERE p.product_id = '${product_id}'
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
    //Parsin values (maria db 10.2 does not support JSON_OBJECTAGG)
    result.description = JSON.parse(result.description);
    result.categories = JSON.parse(result.categories);
    result.filters = JSON.parse(result.filters);
    result.options = JSON.parse(result.options);
    result.attributes = JSON.parse(result.attributes);
    result.wholesales = JSON.parse(result.wholesales);
    if (result.options.length) {
      for (const op of result.options) {
        op.description = JSON.parse(op.description);
      }
    }
    if (result.attributes.length) {
      for (const att of result.attributes) {
        att.description = JSON.parse(att.description);
      }
    }
    //images
    result.image = result.image.split(",");
  } else {
    result = null;
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

  let sql = `SELECT p.product_id, p.quantity, p.image, p.price, p.points, p.tax_id, p.available_at,
              p.view, p.sold, p.status, p.date_added, MIN(ps.price) AS special, pd.title, pd.description, pd.tags, pd.meta_title, pd.meta_description, pd.meta_keywords, t.value AS tax_value,
              c.code AS coupon_code, MAX(c.amount) AS coupon_amount, c.type AS coupon_type              
              FROM product p
              LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
              LEFT JOIN product_category pc ON(p.product_id = pc.product_id)
              LEFT JOIN category cat ON(pc.category_id = cat.category_id)
              LEFT JOIN product_filter pf ON(p.product_id = pf.product_id)
              LEFT JOIN product_special ps ON(p.product_id = ps.product_id AND ps.deadline > NOW() AND ps.status = '1' AND ps.price > 0)
              LEFT JOIN tax t ON(p.tax_id = t.tax_id AND t.status = '1')
              LEFT JOIN coupon_product cp ON(cp.product_id = p.product_id)
              LEFT JOIN coupon_category cc ON(cc.category_id = pc.category_id)
              LEFT JOIN coupon c ON((c.coupon_id = cp.coupon_id OR cc.coupon_id = c.coupon_id) AND c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW())
              `;

  sql += ` WHERE pd.language = '${reqLanguage}'`;

  if (category) {
    category.split(",").forEach((cat, i) => {
      const op = i === 0 ? "AND" : "OR";
      sql += ` ${op} pc.category_id = '${cat}'`;
    });
  }

  if (filter) {
    filter.split(",").forEach((cat, i) => {
      const op = i === 0 ? "AND" : "OR";
      sql += ` ${op} pf.filter_id = '${cat}'`;
    });
  }

  if (special) {
    sql += ` AND (ps.deadline > NOW() AND ps.status = '1' AND ps.price > 0 OR c.status = '1' AND c.date_start < NOW() AND c.date_end > NOW())`;
  }

  if (q) {
    sql += ` AND CONCAT_WS(pd.title, pd.tags, p.product_id, p.price, p.points) LIKE '%${q}%'`;
  }

  sql += ` GROUP BY p.product_id`;

  if (sort) {
    let selector = "p";
    if (sort === "title") {
      selector = "pd";
    }
    if (sort === "categories") {
      selector = "cd";
    }
    sql += ` ORDER BY ${selector}.${sort}  ${direction}`;
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
        image: product.image.split(","),
        price: +price,
        special: +special,
        currency: currency || "",
        coupon,
        points: product.points,
        available_at: product.available_at,
        view: product.view,
        sold: product.sold,
        title: product.title,
        status: product.status,
        categories,
        filters,
      });
    }
  }

  return products;
};

exports.getTotalProducts = async (filters) => {
  const { category, filter, special, q } = filters;

  let sql = `SELECT COUNT(DISTINCT p.product_id) as total FROM product p
            LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
            LEFT JOIN product_category pc ON(p.product_id = pc.product_id)
            LEFT JOIN category cat ON(pc.category_id = cat.category_id)
            LEFT JOIN product_filter pf ON(p.product_id = pf.product_id)
            LEFT JOIN product_special ps ON(p.product_id = ps.product_id)
            LEFT JOIN coupon_product cp ON(cp.product_id = p.product_id)
            LEFT JOIN coupon_category cc ON(cc.category_id = pc.category_id)
            LEFT JOIN coupon c ON(c.coupon_id = cp.coupon_id OR cc.coupon_id = c.coupon_id)
          `;

  sql += ` WHERE pd.language = '${reqLanguage}'`;

  if (category) {
    category.split(",").forEach((cat, i) => {
      const op = i === 0 ? "AND" : "OR";
      sql += ` ${op} pc.category_id = '${cat}'`;
    });
  }
  if (filter) {
    filter.split(",").forEach((cat, i) => {
      const op = i === 0 ? "AND" : "OR";
      sql += ` ${op} pf.filter_id = '${cat}'`;
    });
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

exports.addProduct = withTransaction(async (transaction, body) => {
  const description = [...body.description];
  const options = [...body.options];
  const category = [...body.category];
  const filter = [...body.filter];
  const attribute = [...body.attribute];
  const wholesale_prices = [...body.wholesales];
  delete body.description;
  delete body.options;
  delete body.category;
  delete body.filter;
  delete body.attribute;
  delete body.wholesales;

  // if options exists, this function should decied the product total quantity automaticlly
  // to avoid user mistaked which may lead to option.quantity > product.quantity
  // which can cuz "cart_change_notice" when trying to add to cart a specific option that has higher quantity than product.quantity
  if (options && options.length > 0) {
    const { calculatedQty, lowestPrice } = calculateProductQuantityANDPrice(
      options
    );
    body.quantity = calculatedQty;
    body.price = lowestPrice;
  }

  //insert product
  const [product, fields] = await transaction.query(
    "INSERT INTO product SET ?",
    {
      ...body,
      available_at: body.available_at
        ? body.available_at
        : new Date(Date.now()),
    }
  );
  //insert descriptions
  if (description && description.length > 0) {
    for (let desc of description) {
      await transaction.query("INSERT INTO product_description SET ?", {
        product_id: product.insertId,
        ...desc,
      });
    }
  }
  //insert category
  if (category && category.length > 0) {
    for (let cat of category) {
      await transaction.query("INSERT INTO product_category SET ?", {
        product_id: product.insertId,
        category_id: cat,
      });
    }
  }
  //insert options
  if (options && options.length > 0) {
    for (let opt of options) {
      const [inserOp, _] = await transaction.query(
        "INSERT INTO product_option SET ?",
        {
          product_id: product.insertId,
          quantity: opt.quantity,
          price: opt.price ? opt.price : body.price,
        }
      );
      for (let optDesc of opt.description) {
        await transaction.query("INSERT INTO option_description SET ?", {
          option_id: inserOp.insertId,
          language: optDesc.language,
          title: optDesc.title,
        });
      }
    }
  }
  //insert attribute
  if (attribute && attribute.length > 0) {
    for (let att of attribute) {
      for (let attDesc of att.description) {
        await transaction.query("INSERT INTO product_attribute SET ?", {
          attribute_id: att.attribute_id,
          product_id: product.insertId,
          language: attDesc.language,
          description: attDesc.description,
        });
      }
    }
  }
  //insert filter
  if (filter && filter.length > 0) {
    for (let fil of filter) {
      await transaction.query("INSERT INTO product_filter SET ?", {
        product_id: product.insertId,
        filter_id: fil,
      });
    }
  }

  //insert wholesale_prices
  if (wholesale_prices && wholesale_prices.length > 0) {
    for (let wholesale of wholesale_prices) {
      await transaction.query("INSERT INTO product_wholesale SET ?", {
        product_id: product.insertId,
        quantity: wholesale.quantity,
        price: wholesale.price,
      });
    }
  }

  await transaction.commit();
  return this.getProduct(product.insertId, shortVer);
});

exports.updateProduct = withTransaction(
  async (transaction, body, product_id) => {
    const description = [...body.description];
    const options = [...body.options];
    const category = [...body.category];
    const filter = [...body.filter];
    const attribute = [...body.attribute];
    const wholesale_prices = [...body.wholesales];
    delete body.description;
    delete body.options;
    delete body.category;
    delete body.filter;
    delete body.attribute;
    delete body.wholesales;

    // if options exists, this function should decied the product total quantity and product price automaticlly
    // to avoid user mistaks which may lead to option.quantity > product.quantity OR lowest option.price !== product.price
    // which can cuz "cart_change_notice" when trying to add to cart a specific option that has higher quantity than product.quantity
    if (options && options.length > 0) {
      const { calculatedQty, lowestPrice } = calculateProductQuantityANDPrice(
        options
      );
      body.quantity = calculatedQty;
      body.price = lowestPrice;
    }

    //update product
    const [product, fields] = await transaction.query(
      `UPDATE product SET ? WHERE product_id = '${product_id}'`,
      {
        ...body,
        available_at: body.available_at
          ? body.available_at
          : new Date(Date.now()),
        date_modified: new Date(Date.now()),
      }
    );

    if (!product.affectedRows) {
      throw new ErrorResponse(404, "product not found");
    }
    //update descriptions
    if (description && description.length > 0) {
      for (let desc of description) {
        await transaction.query(`REPLACE INTO product_description SET ?`, {
          product_id: product_id,
          language: desc.language,
          ...desc,
        });
      }
    }
    //Update category
    await transaction.query(
      `DELETE FROM product_category WHERE product_id = '${product_id}'`
    );
    if (category && category.length > 0) {
      for (let cat of category) {
        await transaction.query("INSERT INTO product_category SET ?", {
          product_id: product_id,
          category_id: cat,
        });
      }
    }
    //Update options
    await transaction.query(
      `DELETE FROM product_option WHERE product_id = '${product_id}'`
    );
    if (options && options.length > 0) {
      for (let opt of options) {
        let optionDetail = {
          product_id: product_id,
          quantity: opt.quantity,
          price: opt.price ? opt.price : body.price,
        };
        if (opt.option_id) {
          //if exist, insert with the same option_id (update)
          optionDetail.option_id = opt.option_id;
        }
        const [inserOp, _] = await transaction.query(
          "INSERT INTO product_option SET ?",
          optionDetail
        );
        for (let optDesc of opt.description) {
          //TODO: maybe add image to option?
          await transaction.query("INSERT INTO option_description SET ?", {
            option_id: inserOp.insertId,
            language: optDesc.language,
            title: optDesc.title,
          });
        }
      }
    }
    //Update attribute
    await transaction.query(
      `DELETE FROM product_attribute WHERE product_id = '${product_id}'`
    );
    if (attribute && attribute.length > 0) {
      for (let att of attribute) {
        for (let attDesc of att.description) {
          await transaction.query("INSERT INTO product_attribute SET ?", {
            attribute_id: att.attribute_id,
            product_id: product_id,
            language: attDesc.language,
            description: attDesc.description,
          });
        }
      }
    }
    //Update filter
    await transaction.query(
      `DELETE FROM product_filter WHERE product_id = '${product_id}'`
    );
    if (filter && filter.length > 0) {
      for (let fil of filter) {
        await transaction.query("INSERT INTO product_filter SET ?", {
          product_id: product_id,
          filter_id: fil,
        });
      }
    }

    //update wholesale_prices
    await transaction.query(
      `DELETE FROM product_wholesale WHERE product_id = '${product_id}'`
    );
    if (wholesale_prices && wholesale_prices.length > 0) {
      for (let wholesale of wholesale_prices) {
        let wholesaleDetail = {
          product_id: product_id,
          quantity: wholesale.quantity,
          price: wholesale.price,
        };
        if (wholesale.id) {
          wholesaleDetail.id = wholesale.id;
        }
        await transaction.query(
          "INSERT INTO product_wholesale SET ?",
          wholesaleDetail
        );
      }
    }

    await transaction.commit();
    return this.getProduct(product_id, shortVer);
  }
);

exports.deleteProduct = async (product_id) => {
  const [result, fields] = await db.query(
    `DELETE FROM product WHERE product_id = '${product_id}'`
  );
  if (!result.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("product:product_not_found", { product: product_id })
    );
  }
  return +product_id;
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
    `SELECT c.category_id AS id, c.status, cd.title, cd.description FROM product_category pc
      LEFT JOIN category_description cd ON(pc.category_id = cd.category_id AND cd.language = '${reqLanguage}')
      LEFT JOIN category c ON(c.category_id = pc.category_id)
      WHERE pc.product_id = ${product_id}`
  );

  return categories;
};

exports.getProductOptions = async (product_id) => {
  let sql = `SELECT po.option_id, po.quantity, po.price, od.title
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
    `SELECT id, quantity, price FROM product_wholesale WHERE product_id = ${product_id} ORDER BY quantity`
  );

  return wholesales;
};

exports.getProductFilters = async (product_id) => {
  const [filters, _f] = await db.query(
    `SELECT f.filter_id AS id, fd.title, f.status FROM product_filter pf
      LEFT JOIN filter_description fd ON(pf.filter_id = fd.filter_id AND fd.language = '${reqLanguage}')
      LEFT JOIN filter f ON(f.filter_id = pf.filter_id)
      WHERE pf.product_id = ${product_id}`
  );
  return filters;
};

exports.addViewCount = (product_id, currentView) => {
  db.query(`UPDATE product SET ? WHERE product_id = '${product_id}'`, {
    view: ++currentView,
  });
};

exports.switchStatus = async (product_id, status) => {
  await db.query(`UPDATE product SET ? WHERE product_id = '${product_id}'`, {
    status: status,
  });

  return status;
};

exports.getAllRaw = async (q) => {
  const query = q || "";

  let sql = `SELECT p.product_id, p.image, p.price, p.status, pd.title
  FROM product p 
  LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
  WHERE pd.language = '${reqLanguage}' AND CONCAT_WS(pd.title, pd.tags, p.product_id) LIKE '%${query}%'
  `;

  const [products, _c] = await db.query(sql);

  for (const prod of products) {
    prod.image = prod.image.split(",");
  }
  return products;
};

const calculateProductQuantityANDPrice = (options) => {
  let calculatedQty = 0;
  let lowestPrice = options[0].price;
  for (const op of options) {
    calculatedQty += op.quantity;
    if (op.price < lowestPrice) {
      lowestPrice = op.price;
    }
  }
  return { calculatedQty, lowestPrice };
};
