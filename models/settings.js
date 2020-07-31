const db = require("../config/db");

exports.getSettings = async (code) => {
  let sql = `SELECT * from setting WHERE value IS NOT NULL`;
  if (code) {
    sql += ` AND code = '${code}'`;
  }
  const [settings, fields] = await db.query(sql);

  return settings;
};

exports.getSetting = async (code, key_id) => {
  let sql = `SELECT * from setting WHERE value IS NOT NULL`;
  if (code) {
    sql += ` AND code = '${code}'`;
  }
  if (key_id) {
    sql += ` AND key_id = '${key_id}'`;
  }
  const [settings, fields] = await db.query(sql);

  return settings[0];
};
