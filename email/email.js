const mailer = require("nodemailer");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../i18next");
const Settings = require("../models/settings");
const ejs = require("ejs");

class Email {
  constructor(to, subject, templateUrl, data) {
    this.to = to;
    this.subject = subject;
    this.templateUrl = templateUrl;
    this.data = data;
  }

  async send() {
    try {
      // Setup transporter
      const mailSettings = await Settings.getSettings("config", "email_");

      let transporter = mailer.createTransport({
        host: mailSettings.email_host,
        port: mailSettings.email_port,
        secure: true,
        auth: {
          user: mailSettings.email_user,
          pass: mailSettings.email_password,
        },
      });

      // Load template with data
      const siteSettings = await Settings.getSettings("config", "site_");
      const data = {
        ...this.data,
        siteName: siteSettings.site_name,
        logo: siteSettings.site_logo,
        locale: reqLanguage,
        dir: i18next.dir(reqLanguage),
      };
      const template = await ejs.renderFile(this.templateUrl, data);
      let email = {
        from: `'"${siteSettings.site_name}"' <${mailSettings.email_user}>`,
        to: this.to,
        subject: this.subject,
        html: template,
      };
      // Send Email
      await transporter.sendMail(email);
    } catch (err) {
      console.log(err);
      throw new ErrorResponse(500, i18next.t("common:email_send_error"));
    }
  }
}

module.exports = Email;
