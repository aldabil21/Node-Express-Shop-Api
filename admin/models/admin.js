const db = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");
const crypto = require("crypto");
const Email = require("../../email/email");
const { formatDistanceToNow, isBefore } = require("date-fns");
const { arSA } = require("date-fns/locale");

exports.signin = async (data) => {
  const { email, password } = data;

  const admin = await this.findOne(email);

  if (!admin) {
    throw new ErrorResponse(
      401,
      i18next.t("common:signin_credintials_incorrect")
    );
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new ErrorResponse(
      401,
      i18next.t("common:signin_credintials_incorrect")
    );
  }

  if (admin.status !== 1) {
    throw new ErrorResponse(401, i18next.t("common:account_disabled"));
  }

  const token = await generateToken(admin);

  return { token, role: admin.role, username: admin.firstname };
};

exports.getAdmins = async () => {
  let sql = `
  SELECT admin_id, CONCAT(firstname, ' ', lastname) AS name, email, CONCAT('(',country_code,')',mobile) AS mobile,
  role, status
  FROM admin 
  `;

  const [admins, fields] = await db.query(sql);

  return admins;
};
exports.getAdmin = async (id) => {
  let sql = `
  SELECT admin_id, firstname, lastname, country_code, email, mobile, role, status
  FROM admin WHERE admin_id = '${id}'
  `;

  const [admins, fields] = await db.query(sql);
  let admin;
  if (admins.length) {
    admin = admins[0];
  }
  return admin;
};
exports.addAdmin = async (body) => {
  const { email, country_code, mobile } = body;
  const cellphone = {
    country_code,
    mobile,
  };
  const exist = await this.findOne(email, cellphone);

  if (exist) {
    throw new ErrorResponse(
      422,
      i18next.t("common:admin_data_exists", {
        email: exist.email === email ? email : "",
        mobile: exist.mobile === +mobile ? mobile : "",
      })
    );
  }

  //Create Key id
  const keyRand = crypto.randomBytes(256).toString("hex");
  const kid = crypto.createHash("sha256").update(keyRand).digest("hex");

  //Create initial password to send by Email
  const initialPassword = crypto.randomBytes(4).toString("hex");
  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(initialPassword, salt);

  //Send Email not waiting for it
  const emailData = {
    ...body,
    password: initialPassword,
  };
  const Mailer = new Email(
    email,
    "دعوة إنضمام لإدارة المتجر",
    "email/templates/newAdmin.html",
    emailData
  );
  await Mailer.send();

  // Resiter Admin
  const [registered, fields] = await db.query(`INSERT INTO admin SET ?`, {
    ...body,
    kid,
    password: hashedPassword,
    status: 1,
  });

  return this.findById(registered.insertId);
};

exports.updateAdmin = async (data) => {
  const { id, email, country_code, mobile } = data;

  const [exist, _] = await db.query(`
    SELECT DISTINCT * FROM admin WHERE
    (email = '${email}' OR CONCAT(country_code,mobile) = '${
    country_code + mobile
  }')
    AND admin_id != '${id}'
  `);

  if (exist.length) {
    let _exist = exist[0];
    throw new ErrorResponse(
      422,
      i18next.t("common:admin_data_exists", {
        email: _exist.email === email ? email : "",
        mobile: _exist.mobile === +mobile ? mobile : "",
      })
    );
  }

  delete data.id;
  // Update Admin
  const [updated, fields] = await db.query(
    `UPDATE admin SET ? WHERE admin_id = '${id}'`,
    {
      ...data,
    }
  );

  return this.findById(id);
};

exports.deleteAdmin = async (id) => {
  const [updated, fields] = await db.query(
    `DELETE FROM admin WHERE admin_id = '${id}'`
  );

  return +id;
};
exports.switchStatus = async (admin_id, status) => {
  await db.query(`UPDATE admin SET ? WHERE admin_id = '${admin_id}'`, {
    status: status,
  });

  return status;
};
exports.requestPasswordReset = async (admin) => {
  //Create initial password to send by Email
  const newPassword = crypto.randomBytes(4).toString("hex");
  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  //Send Email & waiting for it
  const emailData = {
    username: admin.name,
    password: newPassword,
  };
  const Mailer = new Email(
    admin.email,
    "إعادة ضبط كلمة المرور",
    "email/templates/adminPassReset.html",
    emailData
  );
  await Mailer.send();

  await db.query(`UPDATE admin SET ? WHERE admin_id = '${admin.admin_id}'`, {
    password: hashedPassword,
  });

  return true;
};
exports.findOne = async (email, cellphone) => {
  let sql = `SELECT DISTINCT * from admin WHERE`;

  if (email) {
    sql += ` email = '${email}'`;
  }

  if (cellphone) {
    if (email) {
      sql += ` OR`;
    }
    const { country_code, mobile } = cellphone;
    // sql += ` country_code = '${country_code}' AND mobile = '${mobile}'`;
    sql += ` CONCAT(country_code,mobile) = '${country_code + mobile}'`;
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
    `SELECT DISTINCT admin_id, CONCAT(firstname, ' ', lastname) AS name, email, CONCAT('(',country_code,')',mobile) AS mobile,
    role, status
    FROM admin WHERE admin_id = '${admin_id}'`
  );

  let foundAdmin;
  if (admin.length) {
    foundAdmin = admin[0];
  }

  return foundAdmin;
};

exports.generateResetPasswordToken = async (admin) => {
  const {
    admin_id,
    firstname,
    lastname,
    email,
    country_code,
    mobile,
    reset_expires,
  } = admin;

  //Already has reset in time
  const withinTime =
    reset_expires && isBefore(new Date(), new Date(reset_expires));
  if (withinTime) {
    const remaining = formatDistanceToNow(new Date(reset_expires), {
      locale: i18next.language === "ar" ? arSA : "",
    });
    throw new ErrorResponse(
      422,
      i18next.t("common:already_requested_reset", { remaining: remaining })
    );
  }

  // Create reset token
  const _token = crypto.randomBytes(32).toString("hex");
  const after30Min = new Date(Date.now() + 30 * 60 * 1000);
  //Send Email & wait for it
  const emailData = {
    username: firstname + " " + lastname,
    url: `forgotpassword/${email}/${_token}`,
  };
  const Mailer = new Email(
    email,
    "إستعادة كلمة المرور",
    "email/templates/forgotpassword.html",
    emailData
  );
  await Mailer.send();

  const [updated, _] = await db.query(
    `UPDATE admin SET ? WHERE admin_id = '${admin_id}'`,
    {
      reset_token: _token,
      reset_expires: after30Min,
    }
  );

  return true;
};

exports.validateForgotPassword = async (email, token) => {
  const [query, _] = await db.query(
    `SELECT DISTINCT * FROM admin WHERE email = '${email}' AND reset_token = '${token}' AND reset_expires > NOW()`
  );

  let admin;

  if (query.length) {
    admin = query[0];
  }

  return admin;
};

exports.resetForgotPassword = async (admin, newPassword) => {
  const { admin_id } = admin;
  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const [query, _] = await db.query(
    `UPDATE admin SET ? WHERE admin_id = '${admin_id}'`,
    {
      password: hashedPassword,
    }
  );

  //Clear reset data, not wait for it
  this.clearAdminResetData(admin_id);

  return true;
};

exports.clearAdminResetData = async (id) => {
  const [query, _] = await db.query(
    `UPDATE admin SET ? WHERE admin_id = '${id}'`,
    {
      reset_token: null,
      reset_expires: null,
    }
  );

  return true;
};

//Used for Authentication
exports.findByKid = async (kid) => {
  const [admin, fields] = await db.query(
    `SELECT DISTINCT * from admin WHERE kid = '${kid}' AND status = '1'`
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
