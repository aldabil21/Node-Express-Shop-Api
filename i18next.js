const i18next = require("i18next");
const backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const { languageLoader } = require("./helpers/settings");
const Settings = require("./models/settings");

languageLoader().then(() => {
  const supportedLngs = Settings.getLangCodesArray();
  const primary = Settings.getPrimaryLangCode();

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
      ns: ["common", "product", "cart", "category"],
      defaultNS: ["common"],
      // interpolation: {
      //   escapeValue: false, //careful XSS
      // },
      detection: { lookupCookie: "locale", lookupHeader: "locale" },
    });
});

module.exports = i18next;
