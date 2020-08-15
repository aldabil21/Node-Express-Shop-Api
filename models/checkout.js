const db = require("../config/db");
const Cart = require("./cart");
const Address = require("./address");
const Coupon = require("./coupon");
const Point = require("./point");
const Settings = require("./settings");
const Tax = require("./tax");
const i18next = require("../i18next");
const ErrorResponse = require("../helpers/error");
const withTransaction = require("../helpers/withTransaction");
const { format } = require("date-fns");

exports.getCheckout = async (data) => {
  const { user_id, order_id } = data;

  //Get products
  const products = await this.getProducts(order_id);

  let notice = "";
  let coupon;
  let points;
  //Validate order_total COUPON/POINTS if order left-over then resumed
  const [unUsedDiscount, _uc] = await db.query(
    `SELECT * from order_totals WHERE order_id = ${order_id} AND code = 'coupon' OR code = 'points'`
  );

  for (const discount of unUsedDiscount) {
    //validate coupon if still valid
    if (discount.code === "coupon") {
      const couponText = discount.text;
      const code = couponText.split(":")[1].split("(")[0];
      const data = {
        code: code ? code.trim() : "",
        user_id,
        order_id,
        orderProducts: products,
      };
      const couponVal = await Coupon.validate(data);
      if (!couponVal.valid) {
        notice = couponVal.message;
        await this.clearCoupon(order_id);
      } else {
        const code = couponVal.couponInfo.code;
        coupon = {
          title: couponVal.couponInfo.title,
          code: code,
          notice: i18next.t("cart:congrats_coupon", { code }),
        };
      }
    }
    //validate points if suffecient
    if (discount.code === "points") {
      const pointsText = discount.text;
      const pointsTotal = pointsText.split(":")[1];
      const data = {
        points: pointsTotal ? +pointsTotal.trim() : 0,
        user_id,
        order_id,
      };
      const pointsVali = await Point.validate(data);

      if (!pointsVali.valid || +pointsVali.maxPoints !== data.points) {
        notice = pointsVali.message;
        await this.clearPoints(order_id);
      } else {
        points = {
          value: +pointsTotal,
          notice: i18next.t("cart:congrats_points", { total: pointsTotal }),
        };
      }
    }
  }

  const totals = await this.getTotals(order_id);

  const result = {
    notice,
    coupon,
    points,
    products,
    totals,
  };

  return result;
};

exports.addOrder = withTransaction(async (transaction, data) => {
  const { user_id } = data;

  const cartItems = await Cart.getCart(data);
  const totals = await Cart.getTotals(cartItems.products);
  const brutto = totals.find((tot) => tot.id === "brutto");
  const withTax =
    Settings.getSetting("config", "tax_status").tax_status === "1";
  const address = await Address.getDefault(user_id);

  const defaultOrder = {
    user_id,
    firstname: address ? address.firstname : "",
    lastname: address ? address.lastname : "",
    mobile: address ? address.mobile : "",
    line1: address ? address.line1 : "",
    country: address ? address.country : "",
    city: address ? address.city : "",
    payment_method: "",
    payment_code: "",
    total: brutto.value,
    order_status_id: 0,
    tracking: "",
  };
  const lat = address ? address.location.x : "";
  const lng = address ? address.location.y : "";

  //Insert cart -> order w default values
  const [order, _o] = await transaction.query(
    `INSERT INTO orders SET location = ST_GeomFromText('POINT(${lat} ${lng})'), ?`,
    defaultOrder
  );

  //Set invoice no.
  const invoice_no = `INV${format(new Date(), "yyMMdd")}${order.insertId}`;
  await transaction.query(
    `UPDATE orders SET ? WHERE order_id = '${order.insertId}'`,
    {
      invoice_no,
    }
  );

  //Insert cart ptoducts
  for (const product of cartItems.products) {
    const price = withTax
      ? Tax.deCalculate(product.price, product.tax_value)
      : product.price;
    const tax = Tax.pure(price, product.tax_value) * product.quantity;

    await transaction.query(`INSERT INTO order_products SET ?`, {
      order_id: order.insertId,
      product_id: product.product_id,
      product_title: product.title,
      product_option: product.option,
      quantity: product.quantity,
      price: +price,
      total: +price * product.quantity,
      tax: tax,
    });
  }

  //Insert order totals
  for (const total of totals) {
    await transaction.query(`INSERT INTO order_totals SET ?`, {
      order_id: order.insertId,
      text: total.text,
      code: total.id,
      value: total.value,
      sort_order: total.sort_order,
    });
  }

  await transaction.commit();
  return { order_id: order.insertId, notice: cartItems.notice };
});

exports.updateOrder = withTransaction(async (transaction, data) => {
  const { order_id, user_id, address_id } = data;

  const cartItems = await Cart.getCart(data);

  //Check if product/category was disabled/removed then clear order products/total and return
  if (!cartItems.products.length) {
    await this.clearOrder(order_id);
    return { order_id, notice: i18next.t("cart:checkout_change_notice") };
  }

  const totals = await Cart.getTotals(cartItems.products);
  const brutto = totals.find((tot) => tot.id === "brutto");
  const withTax =
    Settings.getSetting("config", "tax_status").tax_status === "1";

  let address;
  if (address_id) {
    address = await Address.getAddress(address_id, user_id);
  } else {
    address = await Address.getDefault(user_id);
  }

  const order_data = {
    order_id,
    user_id,
    firstname: address ? address.firstname : "",
    lastname: address ? address.lastname : "",
    mobile: address ? address.mobile : "",
    line1: address ? address.line1 : "",
    country: address ? address.country : "",
    city: address ? address.city : "",
    payment_method: "",
    payment_code: "",
    total: brutto.value,
    order_status_id: 0,
    tracking: "",
  };
  const lat = address ? address.location.x : "";
  const lng = address ? address.location.y : "";

  //Update cart -> order w order values
  const [order, _o] = await transaction.query(
    `UPDATE orders SET location = ST_GeomFromText('POINT(${lat} ${lng})'), ? WHERE order_id = '${order_id}'`,
    {
      ...order_data,
      date_modified: new Date(),
    }
  );

  //Update order products
  await transaction.query(
    `DELETE FROM order_products WHERE order_id = '${order_id}'`
  );
  for (const product of cartItems.products) {
    const price = withTax
      ? Tax.deCalculate(product.price, product.tax_value)
      : product.price;
    const tax = Tax.pure(price, product.tax_value) * product.quantity;

    await transaction.query(`INSERT INTO order_products SET ?`, {
      order_id: order_id,
      product_id: product.product_id,
      product_title: product.title,
      product_option: product.option,
      quantity: product.quantity,
      price: +price,
      total: +price * product.quantity,
      tax: tax,
    });
  }

  //Update order totals
  await transaction.query(
    `DELETE FROM order_totals WHERE order_id = '${order_id}' AND code != 'coupon' AND code != 'points'`
  );
  for (const total of totals) {
    await transaction.query(`INSERT INTO order_totals SET ?`, {
      order_id: order_id,
      text: total.text,
      code: total.id,
      value: total.value,
      sort_order: total.sort_order,
    });
  }

  await transaction.commit();
  return { order_id, notice: cartItems.notice };
});

exports.getUncompleteOrder = async (data) => {
  const { user_id } = data;
  let sql = `SELECT DISTINCT * from orders WHERE user_id = '${user_id}' AND order_status_id = '0'`;

  const [query, fields] = await db.query(sql);

  let order;

  if (query.length) {
    order = query[0];
  }

  return order;
};

exports.getProducts = async (order_id) => {
  const [query, _p] = await db.query(
    `SELECT * FROM order_products WHERE order_id = '${order_id}'
    `
  );

  //Currency
  const currConfig = Settings.getSetting("config", "currency").currency;
  const curr = i18next.t(`common:${currConfig}`);
  const currency = curr || "";

  const products = query.map((prod) => {
    return {
      product_id: prod.product_id,
      product_title: prod.product_title,
      product_option: prod.product_option,
      quantity: prod.quantity,
      price: +prod.price,
      total: +prod.total,
      tax: +prod.tax,
      currency,
    };
  });

  return products;
};
exports.getTotals = async (order_id) => {
  const [query, _t] = await db.query(
    `SELECT * FROM order_totals WHERE order_id = '${order_id}' ORDER BY sort_order`
  );

  let totals = query;
  const discounts = {
    coupon: 0,
    points: 0,
  };

  for (const tot of query) {
    if (tot.code === "coupon" || tot.code === "points") {
      discounts[tot.code] = +tot.value;
    }
  }
  const { coupon, points } = discounts;
  const hasCoupon = coupon < 0;
  const hasPoints = points < 0;

  //Currency
  const currConfig = Settings.getSetting("config", "currency").currency;
  const curr = i18next.t(`common:${currConfig}`);
  const currency = curr || "";

  if (hasCoupon || hasPoints) {
    totals = query.map((t) =>
      t.code === "brutto"
        ? {
            ...t,
            value: +parseFloat(+t.value + coupon + points).toFixed(2),
            currency,
          }
        : { ...t, value: +t.value, currency }
    );
  } else {
    totals = query.map((t) => {
      return { ...t, value: +t.value, currency };
    });
  }

  return totals;
};

exports.redeemCoupon = withTransaction(async (transaction, data) => {
  const { code, user_id, order_id, coupon } = data;

  //Calculate coupon according to type + Get rid of prev coupon if exist
  const [deleteOldCoup, _d] = await transaction.query(
    `DELETE FROM order_totals WHERE order_id = '${order_id}' AND code = 'coupon'`
  );
  const [total, _t] = await transaction.query(`
    SELECT SUM(value) AS value from order_totals WHERE order_id = '${order_id}' AND code = 'brutto' OR code = 'points'
    `);
  const brutto = total[0].value;
  let discountVal = 0;
  let typeNotation = "";
  if (coupon.type === "P") {
    discountVal = (brutto * coupon.amount) / 100;
    typeNotation = "%";
  } else {
    //Currency
    const currConfig = Settings.getSetting("config", "currency").currency;
    const curr = i18next.t(`common:${currConfig}`);
    const currency = curr || "";
    discountVal = coupon.amount;
    typeNotation = currency;

    //If was below zero (maybe with using some points), turn it to 0
    if (brutto - discountVal < 0) {
      discountVal = brutto;
    }
  }
  const couponInfo = {
    order_id,
    text: `${i18next.t("cart:coupon_discount")}: ${code} (${
      coupon.amount
    } ${typeNotation})`,
    code: "coupon",
    value: -discountVal,
    sort_order: 4,
  };

  await transaction.query(`INSERT INTO order_totals SET ?`, couponInfo);

  await transaction.commit();

  return { code: code, value: discountVal };
});

exports.redeemPoints = withTransaction(async (transaction, data) => {
  const { points, discountVal, order_id } = data;

  //Calculate points + Get rid of old one
  const [deleteOldpoints, _d] = await transaction.query(
    `DELETE FROM order_totals WHERE order_id = '${order_id}' AND code = 'points'`
  );
  const pointsInfo = {
    order_id,
    text: `${i18next.t("cart:points_discount")}: ${points}`,
    code: "points",
    value: -discountVal,
    sort_order: 4,
  };

  await transaction.query(`INSERT INTO order_totals SET ?`, pointsInfo);

  await transaction.commit();

  return { value: discountVal };
});
exports.clearOrder = async (order_id) => {
  const [query, fields] = await db.query(
    `DELETE op.*,ot.* FROM order_products op LEFT JOIN order_totals ot ON(op.order_id = ot.order_id) WHERE op.order_id = '${order_id}'`
  );

  if (!query.affectedRows) {
    return false;
  }

  return true;
};

exports.clearCoupon = async (order_id) => {
  const [query, fields] = await db.query(
    `DELETE FROM order_totals WHERE order_id = '${order_id}' AND code = 'coupon'`
  );

  if (!query.affectedRows) {
    return false;
  }

  return true;
};
exports.clearPoints = async (order_id) => {
  const [query, fields] = await db.query(
    `DELETE FROM order_totals WHERE order_id = '${order_id}' AND code = 'points'`
  );

  if (!query.affectedRows) {
    return false;
  }

  return true;
};
