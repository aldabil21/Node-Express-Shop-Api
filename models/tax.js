const db = require("../config/db");

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
