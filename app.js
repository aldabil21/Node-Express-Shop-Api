//App
const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;
//Util & Sec middlewares
const { settingsLoader } = require("./helpers/settings");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("./middlewares/cors");
const rateLimiter = require("./middlewares/rateLimiter");
const { guestId } = require("./middlewares/guestId");
const { errorHandler, error404 } = require("./middlewares/error");
const config = require("./middlewares/config");

//AppConfig loader
settingsLoader().then(() => {
  //App
  const app = express();

  //Helmet
  app.use(helmet());

  //Allow CROS
  app.use(cors);

  //Parsers
  app.use(express.json());

  //XSS
  app.use(xss());
  //Rate Limit
  app.use(rateLimiter());
  //HPP
  app.use(hpp());

  //Statics
  app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
  app.use("/api", express.static(path.join(__dirname, "assets")));

  //My config
  app.use(config);

  //Cookie
  app.use(cookieParser());
  app.use(guestId);

  //Language
  const { i18next } = require("./i18next");
  const i18n = require("i18next-http-middleware");
  const languegeSetter = require("./middlewares/language");
  app.use(i18n.handle(i18next));
  app.use(languegeSetter);

  /**
   * Routes
   */
  // User
  const routes = require("./routes");
  app.use("/api/v1", routes);
  // Admin
  const adminRoutes = require("./admin/routes");
  app.use("/api/v1/admin", adminRoutes);

  //Error handlers
  app.use(error404);
  app.use(errorHandler);

  app.listen(PORT, () => console.log(`RUNNING ON ${PORT}`));
});
