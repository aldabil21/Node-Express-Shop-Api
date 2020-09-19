const db = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");
const crypto = require("crypto");
const Email = require("../../email/email");
const { getHost } = require("../helpers/utils");

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
exports.addAdmin = async (req) => {
  const data = req.body;
  const { email, country_code, mobile } = data;
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

  // Resiter Admin
  const [registered, fields] = await db.query(`INSERT INTO admin SET ?`, {
    ...data,
    kid,
    password: hashedPassword,
    status: 1,
  });

  //Send Email not waiting for it
  const emailData = {
    ...data,
    host: getHost(req),
    password: initialPassword,
  };
  const Mailer = new Email(
    email,
    "دعوة إنضمام لإدارة المتجر",
    "email/templates/newAdmin.html",
    emailData
  );
  Mailer.send();

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
exports.requestPasswordReset = async (admin, req) => {
  //Create initial password to send by Email
  const newPassword = crypto.randomBytes(4).toString("hex");
  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  //Send Email & waiting for it
  const emailData = {
    username: admin.name,
    host: getHost(req),
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

//User for Authentication
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
