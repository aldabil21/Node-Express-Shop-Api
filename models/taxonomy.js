const db = require("../config/db");

exports.isIncludingProducts = async (prodIds = []) => {
  const ids = [0, ...prodIds];
  const [categories, fields] = await db.query(`
    SELECT DISTINCT tr.taxonomy_id FROM taxonomy_relationship tr
    LEFT JOIN taxonomy t ON(tr.taxonomy_id = t.taxonomy_id)
    WHERE tr.object_id IN (${ids}) AND t.type = 'product_category'
  `);
  //Note: dont need to ckeck cat status, already was checked with getCheckout()
  return categories.map((cat) => cat.taxonomy_id);
};
