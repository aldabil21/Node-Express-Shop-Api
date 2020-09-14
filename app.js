const express = require("express");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
const path = require("path");
const { guestId } = require("./middlewares/guestId");
const { settingsLoader } = require("./helpers/settings");
const { errorHandler, error404 } = require("./middlewares/error");
const cors = require("./middlewares/cors");

//AppConfig loader
settingsLoader().then(() => {
  //App
  const app = express();

  //Statics
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.use("/", express.static(path.join(__dirname, "assets", "images")));

  //Parsers
  app.use(express.json());

  //Allow CROS
  app.use(cors);

  //Cookie
  app.use(cookieParser());
  app.use(guestId);

  //Language
  const i18next = require("./i18next");
  const i18n = require("i18next-http-middleware");
  const languegeSetter = require("./middlewares/language");
  app.use(i18n.handle(i18next));
  app.use(languegeSetter);
  /**
   * Routes
   */
  // User
  const auth = require("./routes/auth");
  const products = require("./routes/product");
  const cart = require("./routes/cart");
  const point = require("./routes/point");
  const checkout = require("./routes/checkout");
  const address = require("./routes/address");
  const settings = require("./routes/settings");
  const card = require("./routes/card");
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/products", products);
  app.use("/api/v1/points", point);
  app.use("/api/v1/cart", cart);
  app.use("/api/v1/checkout", checkout);
  app.use("/api/v1/address", address);
  app.use("/api/v1/config", settings);
  app.use("/api/v1/card", card);

  // Admin
  const admin = require("./admin/routes/auth");
  const adminProducts = require("./admin/routes/product");
  const coupon = require("./admin/routes/coupon");
  const specials = require("./admin/routes/specials");
  const filters = require("./admin/routes/filters");
  const categories = require("./admin/routes/categories");
  const tax = require("./admin/routes/tax");
  const attribute = require("./admin/routes/attribute");
  const orders = require("./admin/routes/orders");
  const users = require("./admin/routes/users");
  const adminSettings = require("./admin/routes/settings");
  app.use("/api/v1/admin/auth", admin);
  app.use("/api/v1/admin/products", adminProducts);
  app.use("/api/v1/admin/products", specials);
  app.use("/api/v1/admin/filters", filters);
  app.use("/api/v1/admin/categories", categories);
  app.use("/api/v1/admin/coupons", coupon);
  app.use("/api/v1/admin/tax", tax);
  app.use("/api/v1/admin/attributes", attribute);
  app.use("/api/v1/admin/orders", orders);
  app.use("/api/v1/admin/users", users);
  app.use("/api/v1/admin/settings", adminSettings);

  //Error handlers
  app.use(error404);
  app.use(errorHandler);

  app.listen(PORT, () => console.log(`RUNNING ON ${PORT}`));
});
