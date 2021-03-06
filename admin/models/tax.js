const db = require("../../config/db");

exports.autocomplete = async (q) => {
  const _limit = 20;

  let sql = `SELECT * FROM tax t
  WHERE CONCAT_WS(t.title, t.value) LIKE '%${q}%' AND t.status = '1'
  LIMIT 0, ${_limit}`;

  const [taxes, fields] = await db.query(sql);

  return taxes;
};

exports.getTaxes = async (data) => {
  const { q, page, perPage, sort, direction } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;
  const sorting = sort || "date_added";

  let sql = `SELECT *
  FROM tax t
  WHERE CONCAT_WS(t.title, t.value) LIKE '%${q}%'
  ORDER BY t.${sorting} ${direction} LIMIT ${_start}, ${_limit}`;

  const [taxes, fields] = await db.query(sql);

  return taxes;
};

exports.getById = async (id) => {
  const [query, _] = await db.query(`SELECT * FROM tax WHERE tax_id = '${id}'`);

  let tax;
  if (query.length) {
    tax = query[0];
  }
  return tax;
};

exports.addTax = async (data) => {
  const [query, _] = await db.query(`INSERT INTO tax SET ?`, data);

  return this.getById(query.insertId);
};

exports.updateTax = async (data) => {
  const { id, value, title, status } = data;
  const [query, _] = await db.query(`UPDATE tax SET ? WHERE tax_id = '${id}'`, {
    value,
    title,
    status,
  });

  return this.getById(id);
};

exports.deleteTax = async (id) => {
  const [query, _] = await db.query(`DELETE FROM tax WHERE tax_id = '${id}'`);

  return +id;
};

exports.switchStatus = async (tax_id, status) => {
  await db.query(`UPDATE tax SET ? WHERE tax_id = '${tax_id}'`, {
    status: status,
  });

  return status;
};

exports.calculateAsync = async (tax_id = 0, price = 0) => {
  let sql = `SELECT value from tax WHERE tax_id = '${tax_id}' AND status = '1'`;

  const [tax, fields] = await db.query(sql);
  let taxVal = 0;
  if (tax.length) {
    taxVal = tax[0].value;
  }
  const priceWtax = +price + +price * (taxVal / 100);
  return priceWtax;
};

exports.calculate = (taxVal = 0, price = 0) => {
  const priceWtax = +price + +price * (taxVal / 100);
  return +priceWtax.toFixed(2);
};

exports.deCalculate = (price, taxVal) => {
  const preTaxPrice = price / (1 + taxVal / 100);
  return preTaxPrice.toFixed(2);
};

exports.pure = (price, taxVal) => {
  return price * (taxVal / 100);
};
