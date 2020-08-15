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

exports.getInfo = async (user_id) => {
  let info;

  const pointsSet = Settings.getSettings("config", "points_");

  if (pointsSet.points_status === "1" && +pointsSet.points_value > 0) {
    const userTotalPoints = await this.getCurrentTotalPoints(user_id);
    const total = +parseFloat(pointsSet.points_value * userTotalPoints).toFixed(
      2
    );
    //Currency
    const currCode = Settings.getSetting("config", "currency").currency;
    const currency = i18next.t(`common:${currCode}`);
    info = i18next.t("cart:points_have_info", {
      points: userTotalPoints,
      total,
      currency,
    });
  }

  return info;
};

exports.validate = async (data) => {
  const { points, user_id, order_id } = data;

  let valid = true;
  let message = "";

  //Get points settings
  const setting = Settings.getSettings("config", "points_");
  const points_status = setting.points_status;
  const points_value = +setting.points_value;
  const points_max_percentage = +setting.points_max_percentage;

  //Check if points config enabled
  if (points_status !== "1" || points_value <= 0) {
    valid = false;
    message = i18next.t("cart:points_config_disabled");
    return { valid, message };
  }

  //Validate user current points
  const total = await this.getCurrentTotalPoints(user_id);

  if (points > total) {
    valid = false;
    message = i18next.t("cart:points_insufficient", { points: total });
    return { valid, message, total };
  }

  //Validate points over-covered order total
  const [orderTotal, _t] = await db.query(`
    SELECT SUM(value) AS value from order_totals WHERE order_id = '${order_id}' AND code = 'brutto' OR code = 'coupon'
  `);

  const brutto = +orderTotal[0].value;

  //Calculate discount value
  let discountVal = +points_value * points;

  //Check if redeemed points is more than order total (avoid minus totals/zero totals)
  const maxPercentage = points_max_percentage || 100;
  let maxDiscount = +parseFloat(brutto * (maxPercentage / 100)).toFixed(2);

  let maxPoints = points;
  if (discountVal > maxDiscount) {
    maxPoints = Math.floor(maxDiscount / points_value);
    message = `${i18next.t("cart:points_max_allowed", { points: maxPoints })}`;
    // throw new ErrorResponse(
    //   422,
    //   `${i18next.t("cart:points_max_allowed", { points: maxPoints })}`
    // );
  } else {
    maxDiscount = +discountVal.toFixed(2);
  }

  //Currency
  const currCode = Settings.getSetting("config", "currency").currency;
  const currency = i18next.t(`common:${currCode}`);
  const info = i18next.t("cart:points_have_info", {
    points: total,
    total: discountVal,
    currency,
  });

  return { valid, message, maxPoints, maxDiscount, info };
};
