const Checkout = require("./checkout");
const Settings = require("./settings");
const db = require("../config/db");
const i18next = require("../i18next");

exports.getPoints = async (data) => {
  const { user_id, page, perPage } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;
  const sorting = "date_added";

  let sql = `SELECT * from user_point WHERE user_id = '${user_id}'
  ORDER BY ${sorting} ASC LIMIT ${_start}, ${_limit}`;

  const [points, fields] = await db.query(sql);

  return points;
};

exports.getCurrentTotalPoints = async (user_id) => {
  let sql = `SELECT SUM(points) AS total from user_point WHERE user_id = '${user_id}'`;

  const [totals, fields] = await db.query(sql);
  let total = 0;
  if (totals.length) {
    total = +totals[0].total;
  }

  return total;
};
exports.getTotalCount = async (data) => {
  const { user_id } = data;

  let sql = `SELECT COUNT(*) AS total from user_point WHERE user_id = '${user_id}'`;

  const [totals, fields] = await db.query(sql);
  const { total } = totals[0];

  return total;
};

exports.validate = async (data) => {
  const { points, user_id } = data;

  let valid = true;
  let message = "";

  //Check if points config enabled
  const setting = Settings.getSettings("config", "points_");

  if (setting.points_status !== "1" || +setting.points_value <= 0) {
    valid = false;
    message = i18next.t("cart:points_config_disabled");
    return { valid, message };
  }

  //Get user current points
  const total = await this.getCurrentTotalPoints(user_id);

  if (points > total) {
    valid = false;
    message = i18next.t("cart:points_insufficient", { points: total });
    return { valid, message, total };
  }

  return { valid, message, total };
};
