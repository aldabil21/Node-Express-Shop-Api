const db = require("../config/db");
const User = require("../models/user");
const TapAPI = require("../helpers/tapInstance");
const ErrorResponse = require("../helpers/error");
const i18next = require("../i18next");

/**
 * Tap Customer
 */
exports.getCustomer = async (user_id) => {
  let sql = `SELECT DISTINCT * FROM tap_cards WHERE user_id = '${user_id}'`;

  const [tap, _] = await db.query(sql);

  let tapCustomer;

  if (tap.length) {
    tapCustomer = tap[0];
  }

  return tapCustomer;
};

exports.getCustomersFromTap = async () => {
  const customers = await TapAPI.post(`/customers/list`, {
    // limit: 25,
    // starting_after:"cus_foo" //pagination
  });

  return customers.data;
};

exports.deleteCustomersFromTap = async (tap_id) => {
  const customer = await TapAPI.delete(`/customers/${tap_id}`);
  return customer.data;
};

exports.createCustomer = async (user_id) => {
  const user = await User.findById(user_id);

  const data = {
    first_name: user.firstname,
    last_name: user.lastname,
    email: user.email,
    phone: {
      country_code: user.country_code,
      number: user.mobile,
    },
    metadata: {
      refKid: user.kid,
    },
  };

  const customer = await TapAPI.post("/customers", data);

  const tapCustomer = {
    tap_id: customer.data.id,
  };

  return tapCustomer;
};

/**
 * Tap Cards
 */
exports.getCards = async (user_id) => {
  let sql = `SELECT DISTINCT * FROM tap_cards WHERE user_id = '${user_id}'`;

  const [cards, _] = await db.query(sql);

  return cards;
};

exports.getCard = async (id) => {
  let sql = `SELECT DISTINCT * FROM tap_cards WHERE id = '${id}'`;

  const [card, _] = await db.query(sql);

  let tapCard;

  if (card.length) {
    tapCard = card[0];
  }

  return tapCard;
};

exports.saveCard = async (tap_id, tok_id, user_id) => {
  const card = await TapAPI.post(`/card/${tap_id}`, {
    source: tok_id,
  });

  const cardData = card.data;

  if (!cardData) {
    throw new ErrorResponse(500, i18next.t("card:fail_save_card"));
  }

  const tapCard = {
    user_id,
    tap_id: cardData.customer,
    card_id: cardData.id,
    brand: cardData.brand,
    first_six: cardData.first_six,
    last_four: cardData.last_four,
    name: cardData.name,
    exp_month: cardData.exp_month,
    exp_year: cardData.exp_year,
  };

  const [saved, _] = db.query(`INSER INTO tap_cards SET ?`, tapCard);

  const addedCard = this.getCard(saved.insertId);

  return addedCard;
};
