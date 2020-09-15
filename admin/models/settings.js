const db = require("../../config/db");
const { settingsLoader } = require("../../helpers/settings");

exports.getGenerals = async () => {
  let sql = `
  SELECT * FROM setting WHERE (code = 'config' OR code = 'payment_methods') AND key_id != 'currency'
  `;

  const [settings, _] = await db.query(sql);

  return settings;
};

exports.updateGenerals = async (data) => {
  const values = data.map((d) => [d.setting_id, d.code, d.key_id, d.value]);

  let sql = `
  INSERT INTO setting (setting_id, code, key_id, value) VALUES ? ON DUPLICATE KEY UPDATE value = VALUES(value)
  `;

  const [settings, _] = await db.query(sql, [values]);

  //Reload App settings & refresh global values
  await settingsLoader();

  return this.getGenerals();
};

exports.getSetting = (code, key_id = "") => {
  const setting = AppConfig.find(
    (config) => config.code === code && config.key_id === key_id
  );

  if (!setting) {
    return { key_id: 0 };
  }

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
