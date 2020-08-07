const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../helpers/error");
const i18next = require("../i18next");
const crypto = require("crypto");

exports.register = async (data) => {
  const { email, mobile, password } = data;

  const exist = await this.findOne(email, mobile);

  if (exist) {
    throw new ErrorResponse(
      422,
      i18next.t("common:user_exist", { email: email, mobile: mobile })
    );
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //TODO: Send OTP to Mobile or Email... to be decided
  const otp = Math.floor(1000 + Math.random() * 9000);

  const [registered, fields] = await db.query(`INSERT INTO user SET ?`, {
    ...data,
    password: hashedPassword,
    otp,
  });

  return { email, mobile };
};

exports.confirm = async (data) => {
  const { otp, mobile, email } = data;
  const exist = await this.findOne(email, mobile);

  if (!exist) {
    throw new ErrorResponse(
      404,
      i18next.t("common:user_not_found", { email: email, mobile: mobile })
    );
  }

  if (otp !== exist.otp) {
    //TODO: apply try limit
    throw new ErrorResponse(422, i18next.t("common:otp_error"));
  }

  //Success: delete db otp - change status - generate JWT
  await db.query(`UPDATE user SET ? WHERE user_id = '${exist.user_id}'`, {
    status: "1",
    otp: "",
  });

  //TODO: apply refresh token
  const token = await generateToken(exist);

  return { token, user_id: exist.user_id };
};

exports.signin = async (data) => {
  const { email, password } = data;

  const user = await this.findOne(email);

  if (!user) {
    throw new ErrorResponse(401, i18next.t("common:invalid_credentials"));
  }

  if (user.status !== "1") {
    //TODO: not confirmed, to confirm by otp
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ErrorResponse(401, i18next.t("common:invalid_credentials"));
  }

  const token = await generateToken(user);

  return { token, user_id: user.user_id };
};

exports.findOne = async (email = "", mobile = "") => {
  const [user, fields] = await db.query(
    `SELECT DISTINCT * from user WHERE email = '${email}' OR mobile = '${mobile}'`
  );

  let foundUser;
  if (user.length) {
    foundUser = user[0];
  }

  return foundUser;
};

exports.findById = async (user_id = "") => {
  const [user, fields] = await db.query(
    `SELECT DISTINCT * from user WHERE user_id = '${user_id}'`
  );

  let foundUser;
  if (user.length) {
    foundUser = user[0];
  }

  return foundUser;
};

const generateToken = async (user) => {
  return jwt.sign({ uid: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};
