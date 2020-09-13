const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const i18next = require("../../i18next");
const ErrorResponse = require("../helpers/error");

exports.getUsers = async (data) => {
  const { q, page, perPage, sort, direction } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;
  const sorting = sort || "date_added";
  const query = q || "";

  let sql = `SELECT u.user_id, CONCAT(u.firstname,' ',u.lastname) AS name, u.email, CONCAT('(',u.country_code,')',u.mobile) AS mobile,
  u.status, u.date_added
  FROM user u
  WHERE CONCAT_WS(u.firstname, u.lastname, CONCAT(u.firstname,' ',u.lastname), CONCAT(u.country_code,u.mobile)) LIKE '%${query}%'
  `;

  sql += ` ORDER BY u.${sorting} ${direction}`;
  sql += ` LIMIT ${_start}, ${_limit}`;

  const [users, fields] = await db.query(sql);

  if (users.length) {
    for (const user of users) {
      const { orders_total, purchases_total } = await getUserOrdersInfo(
        user.user_id
      );
      const points = await getCurrentTotalPoints(user.user_id);
      user.orders_total = orders_total;
      user.purchases_total = purchases_total;
      user.points = points;
    }
  }

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

const getUserOrdersInfo = async (user_id) => {
  const [query, _] = await db.query(`
  SELECT CAST(SUM(total) AS DOUBLE) AS total, COUNT(order_id) AS orders from orders WHERE user_id = '${user_id}'
  `);

  let info = {
    purchases_total: 0,
    orders_total: 0,
  };
  if (query.length) {
    info.purchases_total = query[0].total || 0;
    info.orders_total = query[0].orders || 0;
  }
  return info;
};

const getCurrentTotalPoints = async (user_id) => {
  let sql = `SELECT SUM(points) AS total from user_point WHERE user_id = '${user_id}'`;

  const [totals, fields] = await db.query(sql);
  let total = 0;
  if (totals.length) {
    total = +totals[0].total;
  }

  return total;
};
