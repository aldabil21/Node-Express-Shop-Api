const Settings = require("../models/settings");

const settingsLoader = async (req, res, next) => {
  const settings = await Settings.loadSettings();
  global.AppConfig = settings;
  next();
};

module.exports = settingsLoader;
