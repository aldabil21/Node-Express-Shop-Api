const Settings = require("../models/settings");

// Used when init app + update settings
exports.settingsLoader = async () => {
  const settings = await Settings.loadSettings();
  global.AppConfig = settings;
};
// Used when init i18next
exports.languageLoader = async () => {
  const languages = await Settings.loadLanguages();
  // console.log(languages);
  global.AppLanguages = languages;
};

// module.exports = settingsLoader;
