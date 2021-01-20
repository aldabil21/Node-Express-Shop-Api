const db = require("../../config/db");
const { settingsLoader } = require("../../helpers/settings");
const Media = require("./media");

exports.getGenerals = async () => {
  let sql = `
  SELECT * FROM setting WHERE (code = 'config' OR code = 'payment_methods') AND key_id != 'currency'
  `;

  const [settings, _] = await db.query(sql);

  for (const set of settings) {
    if (set.key_id === "site_logo") {
      const value = await Media.getMediaByUrl(set.value, true);
      set.value = [value];
    }
  }

  return settings;
};

exports.updateGenerals = async (data) => {
  let values = [];
  for (const key in data) {
    const d = data[key];
    if (key === "site_logo") {
      const { path } = await Media.getMediaById(
        d.value[0].media_id,
        "original"
      );
      values.push([d.setting_id, d.code, d.key_id, path]);
    } else {
      values.push([d.setting_id, d.code, d.key_id, d.value]);
    }
  }
  // const values = data.map(async (d) => {
  //   if (d.key_id === "site_logo") {
  //     const { path } = await Media.getMediaById(d.value.media_id);
  //     return [d.setting_id, d.code, d.key_id, path];
  //   }
  //   return [d.setting_id, d.code, d.key_id, d.value];
  // });

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
