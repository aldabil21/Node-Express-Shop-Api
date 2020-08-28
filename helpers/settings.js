const Settings = require("../models/settings");

exports.settingsLoader = async () => {
  const settings = await Settings.loadSettings();
  global.AppConfig = settings;
};
exports.languageLoader = async () => {
  const languages = await Settings.loadLanguages();
  global.AppLanguages = languages;
};

// module.exports = settingsLoader;
