const db = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");
const crypto = require("crypto");

exports.signin = async (data) => {
  const { email, password } = data;

  const admin = await this.findOne(email);

  if (!admin) {
    throw new ErrorResponse(
      401,
      i18next.t("common:signin_credintials_incorrect")
    );
  }

  if (admin.status !== 1) {
    throw new ErrorResponse(401, i18next.t("common:account_disabled"));
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new ErrorResponse(
      401,
      i18next.t("common:signin_credintials_incorrect")
    );
  }

  const token = await generateToken(admin);

  return token;
};

exports.findOne = async (email, cellphone) => {
  let sql = `SELECT DISTINCT * from admin WHERE`;

  if (email) {
    sql += ` email = '${email}'`;
  }

  if (cellphone) {
    if (email) {
      sql += ` AND`;
    }
    const { country_code, mobile } = cellphone;
    sql += ` country_code = '${country_code}' AND mobile = '${mobile}'`;
  }

  const [admin, fields] = await db.query(sql);

  let foundAdmin;
  if (admin.length) {
    foundAdmin = admin[0];
  }

  return foundAdmin;
};

exports.findById = async (admin_id) => {
  const [admin, fields] = await db.query(
    `SELECT DISTINCT * from admin WHERE admin_id = '${admin_id}'`
  );

  let foundAdmin;
  if (admin.length) {
    foundAdmin = admin[0];
  }

  return foundAdmin;
};

exports.findByKid = async (kid) => {
  const [admin, fields] = await db.query(
    `SELECT DISTINCT * from admin WHERE kid = '${kid}'`
  );
  let foundAdmin;
  if (admin.length) {
    foundAdmin = admin[0];
  }

  return foundAdmin;
};
const generateToken = async (admin) => {
  return jwt.sign({ kid: admin.kid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};
