const db = require("../../config/db");
const { settingsLoader } = require("../../helpers/settings");

exports.getSettings = async () => {
  let sql = `
  SELECT * FROM setting WHERE code = 'shipping'
  `;

  const [shippings, _] = await db.query(sql);

  return shippings;
};

exports.updateSettings = async (data) => {
  const values = data.map((d) => [d.setting_id, d.code, d.key_id, d.value]);

  let sql = `
  INSERT INTO setting (setting_id, code, key_id, value) VALUES ? ON DUPLICATE KEY UPDATE value = VALUES(value)
  `;

  const [settings, _] = await db.query(sql, [values]);

  //Reload App settings & refresh global values
  await settingsLoader();

  return this.getSettings();
};
