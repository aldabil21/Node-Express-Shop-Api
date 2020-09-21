const db = require("../../config/db");
const bcrypt = require("bcrypt");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

exports.getProfile = async (id) => {
  let sql = `
  SELECT firstname, lastname, country_code, mobile, email, role
  FROM admin WHERE admin_id = '${id}'
  `;

  const [admins, fields] = await db.query(sql);
  let admin;
  if (admins.length) {
    admin = admins[0];
  }
  return admin;
};

exports.updateProfile = async (id, data) => {
  const { firstname, lastname, country_code, mobile } = data;

  const [updated, fields] = await db.query(
    `UPDATE admin SET ? WHERE admin_id = '${id}'`,
    {
      firstname,
      lastname,
      country_code,
      mobile,
    }
  );

  return this.getProfile(id);
};
exports.changePassword = async (id, oldpass, newpass) => {
  const [_admin, _] = await db.query(
    `SELECT DISTINCT * FROM admin WHERE admin_id = '${id}'`
  );
  let admin = _admin[0];

  //Validate old password
  const isMatch = await bcrypt.compare(oldpass, admin.password);
  if (!isMatch) {
    throw new ErrorResponse(422, i18next.t("common:oldpassword_incorrect"), [
      {
        msg: i18next.t("common:oldpassword_incorrect"),
        param: "oldpassword",
      },
    ]);
  }

  //Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newpass, salt);

  // Update Admin password
  const [updated, fields] = await db.query(
    `UPDATE admin SET ? WHERE admin_id = '${id}'`,
    {
      password: hashedPassword,
    }
  );

  return true;
};
