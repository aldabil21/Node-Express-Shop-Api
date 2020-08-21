const db = require("../config/db");
const Product = require("./product");
const Settings = require("./settings");
const Tax = require("./tax");
const i18next = require("../i18next");
const ErrorResponse = require("../helpers/error");

exports.hasCart = async (data) => {
  const { user_id } = data;
  let sql = `SELECT COUNT(*) AS total from cart WHERE user_id = '${user_id}'`;
  const [cart, fields] = await db.query(sql);

  const { total } = cart[0];

  return total > 0;
};

exports.getCart = async (data) => {
  const { user_id } = data;

  let sql = `SELECT c.item_id, c.product_id, c.option_id, c.quantity from cart c WHERE c.user_id = '${user_id}'`;
  const [cartItems, _c] = await db.query(sql);

  let products = [];
  let cartChangedNotice = "";

  //Get cart products
  if (cartItems.length) {
    for (const item of cartItems) {
      const productInfo = await Product.getProduct(item.product_id, [
        "options",
        "wholesales",
      ]);

      if (!productInfo || item.quantity > productInfo.quantity) {
        //product or product_category was deleted or disabled, omit from cart
        cartChangedNotice = i18next.t("cart:cart_changed_notice");
        //delete cart item silently
        this.delete({ id: item.item_id, user_id });
        continue;
      }

      let price = productInfo.price;
      let special = productInfo.special;
      let option = "";

      //set price to option price if exist
      if (item.option_id) {
        const selectedOption = productInfo.options.find(
          (op) => op.option_id === item.option_id
        );
        if (!selectedOption || item.quantity > selectedOption.quantity) {
          //option was deleted or changed, omit from cart
          cartChangedNotice = i18next.t("cart:cart_changed_notice");
          //delete cart item silently
          this.delete({ id: item.item_id, user_id });
          continue;
        }
        price = selectedOption.price;
        option = selectedOption.title;
      }

      //set price to wholesale price if exist
      if (productInfo.wholesales.length) {
        for (const wholesale of productInfo.wholesales) {
          if (item.quantity >= wholesale.quantity) {
            price = wholesale.price;
          }
        }
      }

      //omit special if price got lower cuz of wholesales or option.
      if (+special >= +price) {
        special = null;
      }

      const cartItem = {
        item_id: item.item_id,
        product_id: item.product_id,
        quantity: item.quantity,
        image: productInfo.image,
        title: productInfo.title,
        weight: productInfo.weight,
        price: price,
        tax_value: productInfo.tax_value,
        special: special,
        currency: productInfo.currency,
        option_id: item.option_id,
        option: option,
      };

      products.push(cartItem);
    }
  }

  const cart = {
    products,
    notice: cartChangedNotice,
  };

  return cart;
};

exports.getTotals = async (cartItems = []) => {
  //empty cart return []
  if (!cartItems.length) {
    return [];
  }

  // Get cart totals
  const withTax =
    Settings.getSetting("config", "tax_status").tax_status === "1";

  let neto = {
    id: "neto",
    text: i18next.t("common:neto"),
    value: 0,
    sort_order: 1,
  };
  let taxes = [];
  let brutto = {
    id: "brutto",
    text: i18next.t("common:brutto"),
    value: 0,
    sort_order: 9,
  };
  let totals = [];
  for (const prod of cartItems) {
    let thisPrice = prod.special ? prod.special : prod.price;

    if (withTax) {
      //Deduct tax from product price if it was included (if tax setting was enabled), for correct neto/tax calculation
      //It was decied to always show detail prices in all interefaces (cart, checkout, order)
      thisPrice = Tax.deCalculate(thisPrice, prod.tax_value);
    }

    //Neto
    neto.value += +thisPrice * prod.quantity;

    //Tax
    let thisTax = 0;
    tax = await getProductTaxValue(prod.product_id);
    if (tax) {
      const existTax = taxes.findIndex((t) => t.tax_id === tax.tax_id);
      thisTax = Tax.pure(thisPrice, tax.value) * prod.quantity;
      if (existTax < 0) {
        //Add new tax type
        taxes.push({
          id: "tax",
          tax_id: tax.tax_id,
          text: tax.text,
          value: thisTax,
          sort_order: 2,
        });
      } else {
        //Sum same tax type
        taxes[existTax] = {
          ...taxes[existTax],
          value: taxes[existTax].value + thisTax,
        };
      }
    }

    brutto.value += +thisPrice * prod.quantity + +thisTax;
  }

  //Get Shipping Cost
  const shipping = this.calculateShipping(cartItems, brutto.value);
  brutto.value += shipping.value;

  //Currency
  const currConfig = Settings.getSetting("config", "currency").currency;
  const curr = i18next.t(`common:${currConfig}`);
  const currency = curr || "";

  totals = [neto, ...taxes, shipping, brutto].map((t) => {
    return { ...t, value: +t.value.toFixed(2), currency };
  });

  return totals;
};

exports.calculateShipping = (cartItems = [], brutto) => {
  const shipConfig = Settings.getSettings("shipping");
  const withShipping = shipConfig.status === "1";
  const maxFree = +shipConfig.max_free;
  const isFlat = shipConfig.flat_status === "1";
  const isWeight = shipConfig.weight_status === "1";
  const weightBase = shipConfig.weight_base_amount;
  const weightRate = shipConfig.weight_kg_amount;

  const freeReturn = {
    id: "shipping",
    text: i18next.t("common:free_shipping"),
    value: 0,
    sort_order: 3,
  };

  if (!withShipping) {
    return freeReturn;
  }

  if (maxFree > 0 && brutto > maxFree) {
    return freeReturn;
  }

  //flat rate
  if (isFlat) {
    const flatRate = Settings.getSetting("shipping", "flat_rate");
    const flatValue = flatRate.flat_rate || 0;
    return {
      id: "shipping",
      text: i18next.t("common:flat_rate"),
      value: +flatValue,
      sort_order: 3,
    };
  }

  //By weight
  let cartWeight = 0;
  if (isWeight) {
    cartWeight = calculateWeight(cartItems, "KG");

    const baseval = weightBase || 0;
    const perKiloRate = weightRate || 0;
    const weightTotal = +baseval + cartWeight * perKiloRate;
    return {
      id: "shipping",
      text: i18next.t("common:weight_rate", { weight: cartWeight.toFixed(2) }),
      value: +weightTotal,
      sort_order: 3,
    };
  }

  return {
    id: "shipping",
    text: i18next.t("common:free_shipping"),
    value: 0,
  };
};

exports.add = async (data) => {
  const { product_id, option_id, quantity, user_id } = data;

  const existed = await this.existedItem(product_id, option_id, user_id);
  const product = await Product.getProduct(product_id, ["options"]);

  if (!product) {
    throw new ErrorResponse(
      404,
      i18next.t("product:product_not_available", { product: product_id })
    );
  }

  let existedQuantity = existed ? existed.quantity : 0;
  let stockQuantity = product.quantity;
  //Check which quantity to compare
  if (option_id) {
    const selectedOp = product.options.find((op) => op.option_id === option_id);
    if (!selectedOp) {
      throw new ErrorResponse(
        422,
        i18next.t("product:option_not_available", { id: option_id })
      );
    }
    stockQuantity = selectedOp.quantity;
  }

  const finalToAddQuantity = quantity + existedQuantity;

  //check if over maximum
  if (
    finalToAddQuantity > stockQuantity ||
    (product.maximum && finalToAddQuantity > product.maximum)
  ) {
    throw new ErrorResponse(
      422,
      i18next.t("product:max_quantity_available", {
        product: product.title,
        quantity: stockQuantity,
      })
    );
  }

  //check if below minimum
  if (product.minimum > finalToAddQuantity) {
    throw new ErrorResponse(
      422,
      i18next.t("product:min_quantity_err", {
        product: product.title,
        quantity: product.minimum,
      })
    );
  }

  if (existed) {
    //update quantity
    await db.query(`UPDATE cart SET ? WHERE item_id = '${existed.item_id}'`, {
      quantity: finalToAddQuantity,
    });
  } else {
    //new cart item
    await db.query(`INSERT INTO cart SET ?`, data);
  }

  return this.getCart({ user_id });
};

exports.edit = async (data) => {
  const { id, product_id, option_id, quantity, user_id } = data;

  const cartItem = await this.getCartItem(id, option_id, user_id);
  if (!cartItem) {
    throw new ErrorResponse(
      404,
      i18next.t("product:product_not_available", { product: product_id })
    );
  }
  const product = await Product.getProduct(cartItem.product_id, ["options"]);

  if (!product) {
    throw new ErrorResponse(
      404,
      i18next.t("product:product_not_available", { product: product_id })
    );
  }

  let stockQuantity = product.quantity;
  //Check which quantity to compare
  if (option_id) {
    const selectedOp = product.options.find((op) => op.option_id === option_id);
    if (!selectedOp) {
      throw new ErrorResponse(
        422,
        i18next.t("product:option_not_available", { id: option_id })
      );
    }
    stockQuantity = selectedOp.quantity;
  }

  //check if over maximum
  if (
    quantity > stockQuantity ||
    (product.maximum && quantity > product.maximum)
  ) {
    throw new ErrorResponse(
      422,
      i18next.t("product:max_quantity_available", {
        product: product.title,
        quantity: stockQuantity,
      })
    );
  }

  //check if below minimum
  if (product.minimum > quantity) {
    throw new ErrorResponse(
      422,
      i18next.t("product:min_quantity_err", {
        product: product.title,
        quantity: product.minimum,
      })
    );
  }

  //update quantity
  await db.query(`UPDATE cart SET ? WHERE item_id = '${cartItem.item_id}'`, {
    quantity: quantity,
  });

  return this.getCart({ user_id });
};

exports.delete = async (data) => {
  const { id, user_id } = data;

  let sql = `DELETE FROM cart WHERE item_id = '${id}' AND user_id = '${user_id}'`;

  const [item, fields] = await db.query(sql);

  if (!item.affectedRows) {
    throw new ErrorResponse(404, i18next.t("common:not_found", { id: id }));
  }

  return +id;
};

exports.clear = async (user_id) => {
  let sql = `DELETE FROM cart WHERE user_id = '${user_id}'`;

  const [item, fields] = await db.query(sql);

  let cleared = true;

  if (!item.affectedRows) {
    cleared = false;
  }

  return cleared;
};

//Helpers

exports.existedItem = async (product_id, option_id, user_id) => {
  let sql = `SELECT DISTINCT * FROM cart WHERE product_id = '${product_id}' AND user_id = '${user_id}' AND option_id = '${option_id}'`;

  // if (option_id) {
  //   sql += ` AND option_id = '${option_id}'`;
  // }

  const [item, fields] = await db.query(sql);

  let cartItem;

  if (item.length) {
    cartItem = item[0];
  }

  return cartItem;
};

exports.getCartItem = async (item_id = 0, option_id = 0, user_id = 0) => {
  let sql = `SELECT DISTINCT * FROM cart WHERE item_id = '${item_id}' AND user_id = '${user_id}' AND option_id = '${option_id}'`;
  const [item, fields] = await db.query(sql);

  let cartItem;

  if (item.length) {
    cartItem = item[0];
  }

  return cartItem;
};

exports.setUserIdAfterAuth = async (guest_id = "", user_id = "") => {
  await db.query(`UPDATE cart SET ? WHERE user_id = '${guest_id}'`, {
    user_id,
  });
};

const getProductTaxValue = async (product_id) => {
  const [tax, fields] = await db.query(
    `SELECT DISTINCT t.tax_id, t.title AS text, t.value from product p LEFT JOIN tax t ON(p.tax_id = t.tax_id) WHERE p.product_id = '${product_id}' AND t.status = '1'`
  );

  let taxInfo;

  if (tax.length) {
    taxInfo = tax[0];
  }
  return taxInfo;
};

const calculateWeight = (cartItems = [], unit = "g") => {
  let gram_weight = 0;
  cartItems.forEach((prod) => {
    gram_weight += +prod.weight;
  });

  if (unit === "g") {
    return gram_weight;
  }
  const kg_weight = gram_weight / 1000;
  return kg_weight;
};
