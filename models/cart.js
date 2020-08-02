const db = require("../config/db");
const Product = require("./product");
const Settings = require("./settings");
const Tax = require("./tax");
const i18next = require("../i18next");
const ErrorResponse = require("../helpers/error");

const soap = require("soap");
const path = require("path");
const Aramex = require("../helpers/aramex");

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
        //product was deleted or disabled, omit from cart
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
        special: special,
        option: option,
      };

      products.push(cartItem);
    }
  }

  // Get cart totals
  const taxStatus = Settings.getSetting("tax", "status");
  const withTax = taxStatus.status === "1";
  const shippingStatus = Settings.getSetting("shipping", "status");
  const withShipping = shippingStatus.status === "1";

  let neto = {
    text: "Neto",
    value: 0,
  };
  let taxes = [];
  let brutto = {
    text: "Brutto",
    value: 0,
  };
  let totals = [];
  for (const prod of products) {
    const thisPrice = prod.special ? prod.special : prod.price;

    if (withTax) {
      brutto.value += +thisPrice * prod.quantity;
    } else {
      //Neto
      neto.value += +thisPrice * prod.quantity;

      //Tax
      let thisTax;
      tax = await getProductTaxValue(prod.product_id);
      if (tax) {
        const existTax = taxes.findIndex((t) => t.text === tax.text);
        thisTax = Tax.pure(tax.value, thisPrice) * prod.quantity;
        if (existTax < 0) {
          taxes.push({
            text: tax.text,
            value: thisTax,
          });
        } else {
          taxes[existTax] = {
            ...taxes[existTax],
            value: taxes[existTax].value + thisTax,
          };
        }
      }

      //Brutto
      brutto.value += +thisPrice * prod.quantity + +thisTax;
    }
  }

  let shipping = {
    text: "free_shipping",
    value: 0,
  };

  if (withShipping) {
    shippingInfo = await calculateShipping(products);
    if (shippingInfo) {
      shipping = shippingInfo;
    }
  }

  brutto.value += shipping.value;

  totals = withTax ? [shipping, brutto] : [neto, ...taxes, shipping, brutto];

  const cart = {
    products,
    totals,
    notice: cartChangedNotice,
  };

  return cart;
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

//Helpers

exports.existedItem = async (product_id, option_id, user_id) => {
  let sql = `SELECT DISTINCT * FROM cart WHERE product_id = '${product_id}' AND user_id = '${user_id}'`;

  if (option_id) {
    sql += ` AND option_id = '${option_id}'`;
  }

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
    `SELECT DISTINCT t.title AS text, t.value from product p LEFT JOIN tax t ON(p.tax_id = t.tax_id) WHERE p.product_id = '${product_id}' AND t.status = '1'`
  );

  let taxInfo;

  if (tax.length) {
    taxInfo = tax[0];
  }
  return taxInfo;
};

const calculateShipping = async (cartItems = []) => {
  //flat rate
  const flat = Settings.getSetting("shipping", "flat_status");
  const isFlat = flat.flat_status === "1";
  if (isFlat) {
    const flatRate = Settings.getSetting("shipping", "flat_rate");
    const flatValue = flatRate.flat_rate || 0;
    return {
      text: "flat_rate",
      value: +flatValue,
    };
  }

  // //By weight
  // let cartWeight = 0;
  // const weight = Settings.getSetting("shipping", "weight_status");
  // const isWeight = weight && weight.value === "1";
  // if (isWeight) {
  //   cartWeight = calculateWeight(products);
  //   const weightBase = Settings.getSetting("shipping", "weight_base");
  //   const weightRate = Settings.getSetting("shipping", "weight_rate");
  //   const baseval = weightBase ? weightBase.value : 0;
  //   const perKiloRate = weightRate ? weightRate.value : 0;
  //   const weightTotal = +baseval + (cartWeight / 1000) * perKiloRate;
  //   return {
  //     text: "weight_rate",
  //     value: +weightTotal,
  //   };
  // }

  //By Carriers
  //TODO: SOAP request to Aramex, Smsa...
  // console.log(Aramex.client.data);

  // try {
  //   const client = await soap.createClientAsync(
  //     path.join(
  //       __dirname,
  //       "..",
  //       "aramex_wsdl",
  //       "dev-aramex-rates-calculator-wsdl.wsdl"
  //     )
  //   );
  //   client.CalculateRate(args, (result, err) => {
  //     // console.log(err);
  //     console.log(result);
  //   });
  // } catch (err) {
  //   console.log(err);
  // }
};

const calculateWeight = (cartItems = []) => {
  let weight = 0;
  cartItems.forEach((prod) => {
    weight += +prod.weight;
  });

  return weight;
};
