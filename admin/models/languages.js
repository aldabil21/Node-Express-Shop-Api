const db = require("../../config/db");
const { languageLoader } = require("../../helpers/settings");
const { i18next, initi18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");
const withTransaction = require("../helpers/withTransaction");

exports.getLanguages = async () => {
  let sql = `SELECT * FROM language`;

  const [languages, _] = await db.query(sql);

  return languages;
};

exports.getById = async (id) => {
  let sql = `SELECT * FROM language WHERE language_id = '${id}'`;

  const [query, _] = await db.query(sql);
  let language;
  if (query.length) {
    language = query[0];
  }
  return language;
};

exports.addLanguage = withTransaction(async (transaction, data) => {
  if (+data.is_primary > 0) {
    const [reset, _r] = await transaction.query(
      `UPDATE language SET is_primary = '0'`
    );
  }

  const [lang, _r] = await transaction.query(
    `INSERT INTO language SET ?`,
    data
  );

  await transaction.commit();

  // Reload App language & refresh global values
  await reloadReinitializeI18next();

  return getSupportedLanguages();
});

exports.updateLanguage = withTransaction(async (transaction, data) => {
  const { id, language, code, text, is_primary, status } = data;

  if (+is_primary > 0) {
    const [reset, _r] = await transaction.query(
      `UPDATE language SET is_primary = '0'`
    );
  }
  const [langs, _] = await transaction.query(
    `UPDATE language SET ? WHERE language_id = '${id}'`,
    {
      language: language,
      code: code,
      text: text,
      is_primary: is_primary,
      status: status,
    }
  );

  await transaction.commit();

  // Reload App language & refresh global values
  await reloadReinitializeI18next();

  return getSupportedLanguages();
});

exports.delete = async (id) => {
  let sql = `DELETE FROM language WHERE language_id = '${id}'`;

  const [language, _] = await db.query(sql);

  if (!language.affectedRows) {
    throw new ErrorResponse(404, i18next.t("common:not_found", { id: id }));
  }

  return +id;
};

exports.switchStatus = async (language_id, status) => {
  await db.query(`UPDATE language SET ? WHERE language_id = '${language_id}'`, {
    status: status,
  });

  // Reload App language & refresh global values
  await reloadReinitializeI18next();

  return getSupportedLanguages();
};

exports.getByCode = async (code) => {
  let sql = `SELECT * FROM language WHERE code = '${code}'`;

  const [language, _] = await db.query(sql);

  return language;
};

//Helpers
const getSupportedLanguages = async () => {
  let sql = `SELECT language, code from language WHERE status = '1'`;
  const [language, fields] = await db.query(sql);
  return language;
};
const reloadReinitializeI18next = async () => {
  await languageLoader();
  await initi18next();
};
exports.checkLeastOneEnabled = async () => {
  let sql = `SELECT COUNT(*) AS total FROM language WHERE status = '1'`;
  const [query, fields] = await db.query(sql);
  const { total } = query[0];
  if (total < 2) {
    throw new ErrorResponse(422, i18next.t("settings:at_least_one_enabled"));
  }
  return total;
};
exports.validateDelete = async (id) => {
  let sql = `SELECT * FROM language WHERE status = '1'`;

  const [query, fields] = await db.query(sql);
  let language;
  if (query.length) {
    language = query[0];
  }
  if (query.length < 2 && language.language_id === +id) {
    throw new ErrorResponse(422, i18next.t("settings:at_least_one_enabled"));
  }
  return query;
};
