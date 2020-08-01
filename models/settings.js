const db = require("../config/db");

exports.loadSettings = async () => {
  let sql = `SELECT * from setting`;
  const [settings, fields] = await db.query(sql);
  return settings;
};

exports.getSetting = (code, key_id) => {
  return AppConfig.find(
    (config) => config.code === code && config.key_id === key_id
  );
};

exports.getSettings = (code) => {
  return AppConfig.filter((config) => config.code === code);
};
