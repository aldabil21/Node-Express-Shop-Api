const db = require("../../config/db");
const Settings = require("./settings");
const i18next = require("../../i18next");

exports.getUsers = async (data) => {
  const { q, page, perPage, sort, direction } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;
  let sorting = sort || "date_added";
  const query = q || "";

  //Currency
  const currConfig = Settings.getSetting("config", "currency").currency;
  const curr = i18next.t(`common:${currConfig}`);
  const currency = curr || "";

  let sql = `SELECT u.user_id, CONCAT(u.firstname,' ',u.lastname) AS name, u.email, CONCAT('(',u.country_code,')',u.mobile) AS mobile,
  u.status, u.date_added, COUNT(DISTINCT o.order_id) AS orders,
  (CASE WHEN SUM(DISTINCT o.total) IS NOT NULL THEN CONCAT(CAST(SUM(DISTINCT o.total) AS DOUBLE),' ','${currency}') ELSE CONCAT(0,' ', '${currency}') END) AS total,
  (CASE WHEN SUM(DISTINCT p.points) IS NOT NULL THEN CAST(SUM(DISTINCT p.points) AS INTEGER) ELSE 0 END) AS points
  FROM user u
  LEFT JOIN orders o ON(o.user_id = u.user_id)
  LEFT JOIN user_point p ON(p.user_id = u.user_id)
  WHERE CONCAT_WS(u.firstname, u.lastname, CONCAT(u.firstname,' ',u.lastname), CONCAT(u.country_code,u.mobile)) LIKE '%${query}%'
  GROUP BY u.user_id
  `;

  let sorter = `u.${sorting}`;
  if (
    sorting === "total" ||
    sorting === "orders" ||
    sorting === "points" ||
    sorting === "name"
  ) {
    sorter = sorting;
  }

  sql += ` ORDER BY ${sorter} ${direction}`;
  sql += ` LIMIT ${_start}, ${_limit}`;

  const [users, fields] = await db.query(sql);

  return users;
};
exports.getTotalUsers = async (data) => {
  const { q } = data;

  let sql = `SELECT COUNT(*) AS total FROM user 
  WHERE CONCAT_WS(firstname, lastname, CONCAT(firstname,' ',lastname), CONCAT(country_code,mobile)) LIKE '%${q}%'`;

  const [totals, fields] = await db.query(sql);
  const { total } = totals[0];
  return total;
};

exports.switchStatus = async (user_id, status) => {
  await db.query(`UPDATE user SET ? WHERE user_id = '${user_id}'`, {
    status: status,
  });

  return status;
};
