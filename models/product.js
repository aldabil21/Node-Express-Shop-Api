const db = require("../config/db");
const i18next = require("../i18next");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");

exports.getProduct = async (product_id, shortVer) => {
  const language = i18next.language;

  let sql = `SELECT p.product_id, p.quantity, p.image, p.price, MIN(ps.price) AS special, p.points, p.tax_id, p.available_at,
              pd.title, pd.description, pd.tags, pd.meta_title, pd.meta_description, pd.meta_keywords              
              FROM product p
              LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
              LEFT JOIN product_special ps ON(p.product_id = ps.product_id AND ps.deadline > NOW() AND ps.status = '1')
              `;

  sql += ` WHERE p.product_id = '${product_id}' AND p.status = '1' AND pd.language = '${language}'`;

  const [product, _] = await db.query(sql);

  let result = product[0];

  if (result.product_id) {
    if (shortVer) {
      //get categories
      const [categories, _c] = await db.query(
        `SELECT cd.title, cd.description FROM product_category pc
          LEFT JOIN category_description cd ON(pc.category_id = cd.category_id AND cd.language = '${language}')
          WHERE pc.product_id = ${result.product_id}`
      );
      result.categories = categories;
    } else {
      //Ommit with short version product
      //Get options
      const [
        options,
        _o,
      ] = await db.query(`SELECT po.option_id, po.quantity, po.price, od.title
                          FROM product_option po
                          LEFT JOIN option_description od ON(po.option_id = od.option_id AND od.language = '${language}')
                          WHERE po.product_id = '${result.product_id}'`);

      result.options = options;

      //Get attributes
      const [
        attributes,
        _a,
      ] = await db.query(`SELECT pa.attribute_id, pa.description, ad.title FROM product_attribute pa
                          LEFT JOIN attribute_description ad ON(ad.attribute_id = pa.attribute_id AND ad.language = '${language}')
                          LEFT JOIN attribute aa ON(aa.attribute_id = pa.attribute_id)
                          WHERE pa.product_id = '${result.product_id}' AND pa.language = '${language}' AND aa.status = '1'`);

      result.attributes = attributes;

      //get wholesale_prices
      const [wholesales, _w] = await db.query(
        `SELECT id, quantity, price FROM product_wholesales WHERE product_id = ${result.product_id}`
      );
      result.wholesales = wholesales;
    }
    //get filters
    const [filters, _f] = await db.query(
      `SELECT fd.title FROM product_filter pf
        LEFT JOIN filter_description fd ON(pf.filter_id = fd.filter_id AND fd.language = '${language}')
        WHERE pf.product_id = ${result.product_id}`
    );
    result.filters = filters;
  }

  return result;
};

exports.getProducts = async (filters) => {
  const { category, filter, special, page, perPage, sort, direction } = filters;
  const language = i18next.language;

  const _page = page > 0 ? page : 1;
  const _limit = perPage || 20;
  const _start = (_page - 1) * _limit;

  let sql = `SELECT p.product_id, p.quantity, p.image, p.price, MIN(ps.price) AS special, p.points, p.tax_id, p.available_at,
              pd.title, pd.description, pd.tags, pd.meta_title, pd.meta_description, pd.meta_keywords              
              FROM product p
              LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
              LEFT JOIN product_category pc ON(p.product_id = pc.product_id)
              LEFT JOIN product_filter pf ON(p.product_id = pf.product_id)
              LEFT JOIN product_special ps ON(p.product_id = ps.product_id AND ps.deadline > NOW() AND ps.status = '1')
              `;

  sql += ` WHERE p.status = '1' AND pd.language = '${language}'`;

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
    sql += ` AND ps.price > 0`;
  }

  sql += ` GROUP BY p.product_id`;

  if (sort) {
    sql += ` ORDER BY p.${sort} ${direction}`;
  }

  sql += ` LIMIT ${_start}, ${_limit}`;

  const [products, _] = await db.query(sql);

  if (products.length) {
    for (let product of products) {
      //get categories
      const [categories, _c] = await db.query(
        `SELECT cd.title, cd.description FROM product_category pc
          LEFT JOIN category_description cd ON(pc.category_id = cd.category_id AND cd.language = '${language}')
          WHERE pc.product_id = ${product.product_id}`
      );
      product.categories = categories;

      //get filters
      const [filters, _f] = await db.query(
        `SELECT fd.title FROM product_filter pf
          LEFT JOIN filter_description fd ON(pf.filter_id = fd.filter_id AND fd.language = '${language}')
          WHERE pf.product_id = ${product.product_id}`
      );
      product.filters = filters;
    }
  }

  return products;
};

exports.getTotalProducts = async (filters) => {
  const { category, filter, special } = filters;

  let sql = `SELECT COUNT(DISTINCT p.product_id) as total FROM product p`;

  if (category) {
    sql += ` LEFT JOIN product_category pc ON(p.product_id = pc.product_id)`;
  }

  if (filter) {
    sql += ` LEFT JOIN product_filter pf ON(p.product_id = pf.product_id)`;
  }
  if (special) {
    sql += ` LEFT JOIN product_special ps ON(p.product_id = ps.product_id AND ps.deadline > NOW() AND ps.status = '1')`;
  }

  sql += ` WHERE p.status = '1'`;

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
    sql += ` AND ps.price > 0`;
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
      await transaction.query("INSERT INTO product_wholesales SET ?", {
        product_id: product.insertId,
        quantity: wholesale.quantity,
        price: wholesale.price,
      });
    }
  }

  await transaction.commit();
  return this.getProduct(product.insertId, true);
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
        await transaction.query(
          `UPDATE product_description SET ? WHERE product_id = '${product_id}' AND language = '${desc.language}'`,
          {
            ...desc,
          }
        );
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
      `DELETE FROM product_wholesales WHERE product_id = '${product_id}'`
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
          "INSERT INTO product_wholesales SET ?",
          wholesaleDetail
        );
      }
    }

    await transaction.commit();
    return this.getProduct(product_id, true);
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
  return product_id;
};

////References
// exports.getProductsSingleQuery = async (filters) => {
//   const { language, category, filter, page, sort, direction } = filters;

//   const _page = page > 0 ? page : 1;
//   const _limit = 20;
//   const _start = (_page - 1) * _limit;

//   let sql = `SELECT p.product_id, p.quantity, p.image, p.price, MIN(ps.price) AS special, p.points, p.tax_id, p.available_at,
//               pd.title, pd.description, pd.tags, pd.meta_title, pd.meta_description, pd.meta_keywords,
//               GROUP_CONCAT(DISTINCT fd.title) AS filters, GROUP_CONCAT(DISTINCT cd.title) AS categories
//               FROM product p
//               LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
//               LEFT JOIN product_category pc ON(p.product_id = pc.product_id)
//               LEFT JOIN category_description cd ON (pc.category_id = cd.category_id AND cd.language = '${language}')
//               LEFT JOIN product_filter pf ON(p.product_id = pf.product_id)
//               LEFT JOIN filter_description fd ON (pf.filter_id = fd.filter_id AND fd.language = '${language}')
//               LEFT JOIN product_special ps ON(p.product_id = ps.product_id AND ps.deadline > NOW() AND ps.status = '1')
//               `;

//   sql += ` WHERE p.status = '1' AND pd.language = '${language}'`;

//   if (category) {
//     category.split(",").forEach((cat, i) => {
//       const op = i === 0 ? "AND" : "OR";
//       sql += ` ${op} pc.category_id = '${cat}'`;
//     });
//   }

//   if (filter) {
//     filter.split(",").forEach((cat, i) => {
//       const op = i === 0 ? "AND" : "OR";
//       sql += ` ${op} pf.filter_id = '${cat}'`;
//     });
//   }

//   sql += ` GROUP BY p.product_id`;

//   if (sort) {
//     sql += ` ORDER BY p.${sort} ${direction}`;
//   }

//   sql += ` LIMIT ${_start}, ${_limit}`;

//   const [products, fields] = await db.query(sql);

//   return products;
// };
