const db = require("../config/db");

exports.loadSettings = async () => {
  let sql = `SELECT * from setting`;
  const [settings, fields] = await db.query(sql);
  return settings;
};

exports.getSetting = (code, key_id) => {
  const setting = AppConfig.find(
    (config) => config.code === code && config.key_id === key_id
  );
  const key = setting.key_id || key_id;
  const value = setting.value || null;
  return { [key]: value };
};

exports.getSettings = (code, key_id = "") => {
  const settings = AppConfig.filter(
    (config) => config.code === code && config.key_id.startsWith(key_id)
  );
  const settingsKeyVal = {};
  for (const set of settings) {
    settingsKeyVal[set.key_id] = set.value;
  }
  return settingsKeyVal;
};
