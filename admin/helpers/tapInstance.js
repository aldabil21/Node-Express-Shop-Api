const { default: Axios } = require("axios");
const Setting = require("../models/settings");

const getAPI = () => {
  return Setting.getSetting("config", "tap_auth").tap_auth;
};
const instance = Axios.create({
  baseURL: "https://api.tap.company/v2",
  headers: {
    Authorization: `Bearer ${getAPI()}`,
  },
});

module.exports = instance;
