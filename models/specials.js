const db = require("../config/db");
const i18next = require("../i18next");
const ErrorResponse = require("../helpers/error");

exports.getProductSpecials = async (product_id) => {
  const [specials, fields] = await db.query(
    `SELECT * FROM product_special WHERE product_id = '${product_id}'`
  );
  return specials;
};

exports.addProductSpecial = async (data) => {
  const { product_id } = data;

  const [specials, _s] = await db.query(
    `INSERT INTO product_special SET ?`,
    data
  );
  if (!specials.insertId) {
    throw new ErrorResponse(500, i18next.t("common:add_error"));
  }
  return this.getProductSpecials(product_id);
};

exports.updateProductSpecial = async (data) => {
  const { product_id, id } = data;

  const [specials, _s] = await db.query(
    `UPDATE product_special SET ? WHERE id = '${id}'`,
    {
      ...data,
      updated_at: new Date(),
    }
  );

  if (!specials.affectedRows) {
    throw new ErrorResponse(404, i18next.t("common:not_found", { id: id }));
  }

  return this.getProductSpecials(product_id);
};

exports.deleteProductSpecial = async (id) => {
  const [specials, _s] = await db.query(
    `DELETE FROM product_special WHERE id = '${id}'`
  );

  if (!specials.affectedRows) {
    throw new ErrorResponse(404, i18next.t("common:not_found", { id: id }));
  }

  return id;
};
