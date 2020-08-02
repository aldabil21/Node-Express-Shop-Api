const Settings = require("../models/settings");

const settingsLoader = async () => {
  const settings = await Settings.loadSettings();
  global.AppConfig = settings;
};

module.exports = settingsLoader;
