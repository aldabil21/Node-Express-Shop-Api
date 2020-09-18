const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");
const Settings = require("./settings");

exports.getOrders = async (data) => {
  const {
    q,
    page,
    perPage,
    sort,
    direction,
    payment_method,
    order_status,
  } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage || 20;
  const _start = (_page - 1) * _limit;
  const query = q || "";
  let _sort = sort || "date_added";

  let sql = `
    SELECT o.order_id, o.invoice_no, o.payment_method, o.total, o.date_added, o.order_status_id, o.tracking, o.tracking_company, os.text AS status,
    CONCAT(u.firstname,' ',u.lastname) as user, CONCAT('(',u.country_code,')',u.mobile) as mobile
    FROM orders o
    LEFT JOIN order_status os ON(o.order_status_id = os.order_status_id AND os.language = '${reqLanguage}')
    LEFT JOIN user u ON(o.user_id = u.user_id)
    WHERE CONCAT_WS(o.invoice_no, o.total, CONCAT(u.firstname,' ',u.lastname)) LIKE '%${query}%' AND o.order_status_id > 0
    `;

  if (payment_method) {
    sql += ` AND o.payment_method = '${payment_method}'`;
  }
  if (order_status) {
    sql += ` AND o.order_status_id = '${order_status}'`;
  }

  let selector = "o";
  if (_sort === "user") {
    _sort = "user_id";
    selector = "u";
  } else if (_sort === "status") {
    _sort = "order_status_id";
  }

  sql += ` ORDER BY ${selector}.${_sort} ${direction} LIMIT ${_start}, ${_limit}`;

  const [results, _] = await db.query(sql);

  //TODO: to include human readable payment methods in db query - settings adding payment methods with names (ex: payment_method_description table)
  const initialStatus = 3;
  if (results.length) {
    for (const result of results) {
      result.payment_method = i18next.t(`cart:${result.payment_method}`);
    }
  }

  return results;
};

exports.getTotalOrders = async (data) => {
  const { q, payment_method, order_status } = data;

  const query = q || "";

  let sql = `SELECT COUNT(DISTINCT o.order_id) as total FROM orders o
    LEFT JOIN order_status os ON(o.order_status_id = os.order_status_id AND os.language = '${reqLanguage}')
    LEFT JOIN user u ON(o.user_id = u.user_id)
    WHERE CONCAT_WS(o.invoice_no, o.total, u.firstname, u.lastname) LIKE '%${query}%' AND o.order_status_id > 0
  `;

  if (payment_method) {
    sql += ` AND o.payment_method = '${payment_method}'`;
  }
  if (order_status) {
    sql += ` AND o.order_status_id = '${order_status}'`;
  }

  const [orders, _] = await db.query(sql);
  const { total } = orders[0];

  return total;
};
exports.getOrder = async (order_id) => {
  let sql = `
    SELECT o.order_id, o.invoice_no, o.payment_method, o.total, o.date_added, o.tracking, o.tracking_company, os.text AS status, up.points,
    CONCAT(u.firstname,' ',u.lastname) as user, CONCAT('(',u.country_code,')',u.mobile) as mobile,
    JSON_OBJECT(
        "name",CONCAT(o.firstname,' ',o.lastname),
        "country",o.country,
        "city",o.city,
        "line1",o.line1,
        "mobile", CONCAT('(',o.country_code,')',o.mobile),
        "lat",ST_X(o.location),
        "lng",ST_Y(o.location)
    ) AS receiver,

    CONCAT('[',
        GROUP_CONCAT(DISTINCT
            JSON_OBJECT(
            "order_product_id", op.order_product_id,
            "product_id", op.product_id,
            "title", op.product_title,
            "option", op.product_option,
            "quantity", op.quantity,
            "price", op.price,
            "total", op.total,
            "price_code", op.price_code
            )
        )
    ,']') AS products,

    CONCAT('[',
        GROUP_CONCAT(DISTINCT
          CASE WHEN ot.code != 'brutto' THEN
            JSON_OBJECT(
            "text", ot.text,
            "value", ot.value
            )
            ELSE
            JSON_OBJECT(
              "text", ot.text,
              "value", (SELECT CAST(SUM(value) AS DOUBLE) FROM order_totals WHERE order_id = '${order_id}' AND code != 'brutto')
              )
            END
            ORDER BY ot.sort_order
        )
    ,']') AS totals,

    CONCAT('[',
        GROUP_CONCAT(DISTINCT
            JSON_OBJECT(
            "order_history_id", oh.order_history_id,
            "order_status_id", oh.order_status_id,
            "status", hs.text,
            "comment", oh.comment,
            "date_added", oh.date_added
            )
            ORDER BY oh.date_added
        )
    ,']') AS history

    FROM orders o
    LEFT JOIN order_status os ON(o.order_status_id = os.order_status_id AND os.language = '${reqLanguage}')
    LEFT JOIN user u ON(o.user_id = u.user_id)
    LEFT JOIN order_products op ON(op.order_id = o.order_id)
    LEFT JOIN order_totals ot ON(ot.order_id = o.order_id)
    LEFT JOIN order_history oh ON(oh.order_id = o.order_id)
    LEFT JOIN order_status hs ON(oh.order_status_id = hs.order_status_id AND hs.language = '${reqLanguage}')
    LEFT JOIN user_point up ON(o.order_id = up.order_id AND up.points >= 0)
    WHERE o.order_id = '${order_id}' 
    `;

  const [query, _] = await db.query(sql);

  let order;
  if (query.length && query[0].order_id) {
    order = query[0];
    order.receiver = JSON.parse(order.receiver);
    order.products = JSON.parse(order.products);
    order.totals = JSON.parse(order.totals);
    order.history = JSON.parse(order.history);

    //TODO: to include human readable payment methods in db query - settings adding payment methods with names (ex: payment_method_description table)
    order.payment_method = i18next.t(`cart:${order.payment_method}`);

    //Currency
    const currConfig = Settings.getSetting("config", "currency").currency;
    const curr = i18next.t(`common:${currConfig}`);
    const currency = curr || "";
    order.currency = currency;
  }

  return order;
};

exports.addHistory = withTransaction(async (transaction, data) => {
  const { order_id, status_id, comment, tracking, company } = data;

  //Add history
  const [query, _h] = await transaction.query(
    `INSERT INTO order_history SET ?`,
    {
      order_id,
      order_status_id: status_id,
      comment: comment || "",
      date_added: new Date(),
    }
  );

  //Update order status + tracking if exists
  const order_data = {
    order_status_id: status_id,
  };
  if (tracking) {
    order_data.tracking = tracking;
  }
  if (company) {
    order_data.tracking_company = company;
  }
  const [ordQuery, _] = await transaction.query(
    `UPDATE orders SET ? WHERE order_id = '${order_id}'`,
    {
      ...order_data,
      date_modified: new Date(),
    }
  );

  if (!query.affectedRows || !ordQuery.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("order:fail_add_history", { id: order_id })
    );
  }

  transaction.commit();

  //TODO: Send email to customer

  return this.getHistory(query.insertId);
});

exports.getHistory = async (id) => {
  const [query, _h] = await db.query(
    `SELECT *, os.text AS status FROM order_history oh
     LEFT JOIN order_status os ON(oh.order_status_id = os.order_status_id AND os.language = '${reqLanguage}')
     WHERE oh.order_history_id = '${id}'
    `
  );

  let history;
  if (query.length) {
    history = query[0];
  }
  return history;
};
exports.getStatuses = async () => {
  const [query, _h] = await db.query(
    `SELECT * FROM order_status WHERE order_status_id > 0 AND language = '${reqLanguage}'`
  );

  return query;
};
exports.isValidStatus = async (id) => {
  const [query, _] = await db.query(
    `SELECT * FROM order_status WHERE order_status_id = '${id}'`
  );
  let status;
  if (query.length) {
    status = query[0];
  }
  return status;
};
