const db = require("../../config/db");
const Settings = require("../models/settings");
const { i18next } = require("../../i18next");
const { getDaysInMonth } = require("date-fns");
const { getProductImages } = require("./product");

exports.getNumbers = async () => {
  const needactionorders = await needActionOrders();
  const totalorders = await totalOrders();
  const brutto = await totalSales();
  const discounts = await totalDiscounts();
  const customers = await totalCustomers();
  const neglectedcarts = await neglectedCarts();
  const result = {
    needactionorders,
    totalorders,
    brutto,
    discounts,
    customers,
    neglectedcarts,
  };

  return result;
};

exports.getCharts = async (monthly, daily) => {
  const sales = await getSaleChart(monthly, daily);
  const geochart = await getGeoChart(monthly, daily);
  return { sales, geochart };
};

exports.getRanks = async () => {
  const views = await getMostViewdProducts();
  const sold = await getMostSoldProducts();
  const loyals = await getMostLoyalCustomer();
  return { views, sold, loyals };
};

/**
 * Helpers
 */
const totalOrders = async () => {
  let sql = `SELECT COUNT(*) AS total FROM orders WHERE order_status_id > 0`;

  const [query, fields] = await db.query(sql);

  const { total } = query[0];

  return total;
};
const needActionOrders = async () => {
  let sql = `SELECT COUNT(*) AS total FROM orders WHERE order_status_id = '3'`;

  const [query, fields] = await db.query(sql);

  const { total } = query[0];

  return total;
};
const neglectedCarts = async () => {
  let sql = `SELECT COUNT(*) AS total FROM orders WHERE order_status_id = '0'`;

  const [query, fields] = await db.query(sql);

  const { total } = query[0];

  return total;
};
const totalSales = async () => {
  //Currency
  const currConfig = Settings.getSetting("config", "currency").currency;
  const curr = i18next.t(`common:${currConfig}`);
  const currency = curr || "";
  let sql = `
  SELECT CASE WHEN SUM(ot.value) IS NOT NULL THEN SUM(ot.value) ELSE 0 END AS total FROM order_totals ot
  LEFT JOIN orders o ON(o.order_id = ot.order_id)
  WHERE ot.code = 'brutto' AND o.order_status_id > 0`;

  const [query, fields] = await db.query(sql);

  const { total } = query[0];

  return total + " " + currency;
};
const totalDiscounts = async () => {
  //Currency
  const currConfig = Settings.getSetting("config", "currency").currency;
  const curr = i18next.t(`common:${currConfig}`);
  const currency = curr || "";

  let sql = `
  SELECT CASE WHEN ABS(SUM(ot.value)) IS NOT NULL THEN ABS(SUM(ot.value)) ELSE 0 END AS total FROM order_totals ot
  LEFT JOIN orders o ON(o.order_id = ot.order_id)
  WHERE o.order_status_id > 0 AND (ot.code = 'points' OR ot.code = 'coupon')`;

  const [query, fields] = await db.query(sql);

  const { total } = query[0];

  return total + " " + currency;
};
const totalCustomers = async () => {
  let sql = `SELECT COUNT(*) AS total FROM user WHERE status = '1'`;

  const [query, fields] = await db.query(sql);

  const { total } = query[0];

  return total;
};

const getSaleChart = async (monthly, daily) => {
  let result = [];
  let daysInMonth = 30;

  let sql = ``;
  if (monthly) {
    //MONTHLY
    sql = `SELECT SUM(total) AS value, MONTH(date_added) AS vAxis FROM orders WHERE order_status_id > 0
    AND YEAR(date_Added) = '${monthly}' GROUP BY MONTH(date_added)`;
  } else if (daily) {
    //DAILY
    const dailyData = daily.split(",");
    const year = dailyData[0] || new Date().getFullYear();
    const month = dailyData[1] || new Date().getMonth() + 1;
    daysInMonth = getDaysInMonth(new Date(year, month - 1));

    sql = `SELECT SUM(total) AS value, DAY(date_added) AS vAxis FROM orders WHERE order_status_id > 0
    AND YEAR(date_Added) = '${year}' AND MONTH(date_Added) = '${month}' GROUP BY DAY(date_added)`;
  } else {
    //YEARLY
    sql = `SELECT SUM(total) AS value, YEAR(date_added) AS vAxis FROM orders WHERE order_status_id > 0
    GROUP BY YEAR(date_added)`;
  }

  const [sales, fields] = await db.query(sql);

  //Arrange results for full 12 months / full 30 days
  if (monthly) {
    const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    result = MONTHS.map((mon) => {
      const hasIndex = sales.findIndex((sale) => sale.vAxis === mon);
      if (hasIndex >= 0) {
        return sales[hasIndex];
      } else {
        return {
          value: "0",
          vAxis: mon,
        };
      }
    });
  } else if (daily) {
    const days = "d".repeat(daysInMonth);
    const daysArray = days.split("");
    result = daysArray.map((day, i) => {
      const hasIndex = sales.findIndex((sale) => sale.vAxis === i + 1);
      if (hasIndex >= 0) {
        return sales[hasIndex];
      } else {
        return {
          value: "0",
          vAxis: i + 1,
        };
      }
    });
  } else {
    result = sales;
  }

  return result;
};

const getGeoChart = async (monthly, daily) => {
  let sql = `SELECT COUNT(city) AS value, city FROM orders WHERE order_status_id > 0`;
  if (monthly) {
    //MONTHLY
    sql += ` AND YEAR(date_Added) = '${monthly}'`;
  } else if (daily) {
    //DAILY
    const dailyData = daily.split(",");
    const year = dailyData[0] || new Date().getFullYear();
    const month = dailyData[1] || new Date().getMonth() + 1;

    sql += ` AND YEAR(date_Added) = '${year}' AND MONTH(date_Added) = '${month}'`;
  } else {
    //YEARLY - Nothing, get all
  }

  sql += ` GROUP BY city`;

  const [geos, fields] = await db.query(sql);

  return geos;
};

const getMostViewdProducts = async () => {
  let sql = `
  SELECT p.product_id AS id, pd.title, p.view AS value FROM product p
  LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
  WHERE pd.language = '${reqLanguage}'
  ORDER BY p.view DESC
  Limit 0, 5
  `;

  const [query, _] = await db.query(sql);

  if (query.length) {
    for (const prod of query) {
      prod.image = await getProductImages(prod.id);
    }
  }

  return query;
};
const getMostSoldProducts = async () => {
  let sql = `
  SELECT p.product_id AS id, pd.title, p.sold AS value FROM product p
  LEFT JOIN product_description pd ON(p.product_id = pd.product_id)
  WHERE pd.language = '${reqLanguage}'
  ORDER BY p.sold DESC
  Limit 0, 5
  `;

  const [query, _] = await db.query(sql);

  if (query.length) {
    for (const prod of query) {
      prod.image = await getProductImages(prod.id);
    }
  }

  return query;
};
const getMostLoyalCustomer = async () => {
  let sql = `
  SELECT u.user_id AS id, CONCAT(u.firstname ,' ', u.lastname) AS title, CONCAT(u.country_code, u.mobile) AS subtitle,
  SUM(o.total) AS value FROM orders o
  LEFT JOIN user u ON(u.user_id = o.user_id)
  WHERE o.order_status_id > 0
  GROUP BY o.user_id
  ORDER BY value DESC
  Limit 0, 5
  `;

  const [query, _] = await db.query(sql);

  //Currency
  const currConfig = Settings.getSetting("config", "currency").currency;
  const curr = i18next.t(`common:${currConfig}`);
  const currency = curr || "";

  let loyals = [];
  if (query.length) {
    for (const user of query) {
      if (user.id) {
        loyals.push({ ...user, value: user.value + " " + currency });
      }
    }
  }

  return loyals;
};
