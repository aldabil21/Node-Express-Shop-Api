const i18next = require("i18next");
const backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const { languageLoader } = require("./helpers/settings");
const Settings = require("./models/settings");

const initi18next = async () => {
  const supportedLngs = Settings.getLangCodesArray();
  const primary = Settings.getPrimaryLangCode();
  // console.log("initialize");
  return i18next
    .use(backend)
    .use(middleware.LanguageDetector)
    .init({
      //   debug: true,
      lng: primary,
      supportedLngs: supportedLngs,
      preload: supportedLngs,
      fallbackLng: primary,
      backend: {
        loadPath: "locales/{{lng}}/{{ns}}.json",
      },
      ns: [
        "common",
        "product",
        "cart",
        "category",
        "attribute",
        "coupon",
        "order",
        "settings",
      ],
      defaultNS: ["common"],
      // interpolation: {
      //   escapeValue: false, //careful XSS
      // },
      detection: { lookupCookie: "locale", lookupHeader: "locale" },
    });
};

languageLoader().then(() => {
  //wrap with function for export to be able to reinit/refresh from outside dynamically (ex: when disable/add/delete a language etc...)
  return initi18next();
});

module.exports = { i18next, initi18next };
