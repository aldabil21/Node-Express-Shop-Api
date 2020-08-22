const db = require("../config/db");

exports.isIncludingProducts = async (prodIds = []) => {
  const ids = [0, ...prodIds];
  const [categories, fields] = await db.query(`
    SELECT DISTINCT category_id FROM product_category WHERE product_id IN (${ids})
  `);
  // console.log(prodIds);
  //Note: dont need to ckeck cat status, already was checked with getCheckout()
  return categories.map((cat) => cat.category_id);
};
