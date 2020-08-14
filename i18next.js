const i18next = require("i18next");
const backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");

i18next
  .use(backend)
  .use(middleware.LanguageDetector)
  .init({
    //   debug: true,
    lng: "ar",
    supportedLngs: ["ar", "en"],
    preload: ["ar", "en"],
    fallbackLng: "ar",
    backend: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
    },
    ns: ["common", "product", "cart"],
    defaultNS: ["common"],
    // interpolation: {
    //   escapeValue: false, //careful XSS
    // },
    detection: { lookupCookie: "locale", lookupHeader: "accept-language" },
  });

module.exports = i18next;
