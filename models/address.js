const db = require("../config/db");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");
const i18next = require("../i18next");

exports.getDefault = async (user_id) => {
  let sql = `SELECT DISTINCT * FROM address WHERE user_id = '${user_id}' AND is_primary = '1'`;

  const [query, fields] = await db.query(sql);

  let address;
  if (query.length) {
    address = query[0];
  }

  return address;
};

exports.getAddress = async (id = "", user_id = "") => {
  let sql = `SELECT DISTINCT * FROM address WHERE address_id = '${id}' AND user_id = '${user_id}'`;

  const [query, fields] = await db.query(sql);

  let address;
  if (query.length) {
    address = query[0];
  }

  return address;
};

exports.getAddresses = async (data) => {
  const { user_id } = data;

  let sql = `SELECT * FROM address WHERE user_id = '${user_id}'`;

  const [addresses, fields] = await db.query(sql);

  return addresses;
};

exports.add = async (data) => {
  const { lat, lng } = data;

  const [address, fields] = await db.query(
    `INSERT INTO address SET location = ST_GeomFromText('POINT(${lat} ${lng})'), ?`,
    {
      ...data,
    }
  );

  return this.getAddress(address.insertId, data.user_id);
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

// exports.getCategory = async (category_id, withChildren = true) => {
//   let sql = `SELECT c.category_id, c.image, c.parent_id, c.sort_order, c.status, cd.title,
//   cd.description, cd.meta_title, cd.meta_description, cd.meta_keyword
//   FROM category c
//   LEFT JOIN category_description cd ON(c.category_id = cd.category_id)
//   WHERE c.category_id ='${category_id}' AND cd.language = '${reqLanguage}'
//   `;
//   const [category, fields] = await db.query(sql);

//   if (category.length && withChildren) {
//     this.getChildCategories(category.category_id);
//   }

//   return category[0];
// };

// exports.addCategory = withTransaction(async (transaction, body) => {
//   const description = [...body.description];
//   delete body.description;

//   const [category, _] = await transaction.query(`INSERT INTO category SET ?`, {
//     ...body,
//   });

//   if (description) {
//     for (const desc of description) {
//       await transaction.query(`INSERT INTO category_description SET ?`, {
//         category_id: category.insertId,
//         ...desc,
//       });
//     }
//   }
//   await transaction.commit();

//   return this.getCategory(category.insertId);
// });

// exports.updateCategory = withTransaction(async (transaction, data) => {
//   const description = [...data.description];
//   const category_id = data.id;
//   delete data.description;
//   delete data.id;

//   const [category, _] = await transaction.query(
//     `UPDATE category SET ? WHERE category_id = '${category_id}'`,
//     {
//       ...data,
//       date_modified: new Date(),
//     }
//   );

//   if (!category.affectedRows) {
//     throw new ErrorResponse(
//       404,
//       i18next.t("common:not_found", { id: category_id })
//     );
//   }

//   if (description) {
//     for (const desc of description) {
//       await transaction.query(
//         `UPDATE category_description SET ? WHERE category_id = '${category_id}' AND language = '${desc.language}'`,
//         desc
//       );
//     }
//   }

//   await transaction.commit();

//   return this.getCategory(category_id);
// });

// exports.deleteCategory = async (category_id) => {
//   const [category, _s] = await db.query(
//     `DELETE FROM category WHERE category_id = '${category_id}'`
//   );

//   if (!category.affectedRows) {
//     throw new ErrorResponse(
//       404,
//       i18next.t("common:not_found", { id: category_id })
//     );
//   }
//   const [children, _c] = await db.query(
//     `DELETE FROM category WHERE parent_id = '${category_id}'`
//   );

//   return +category_id;
// };
