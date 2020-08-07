const express = require("express");
const cookieParser = require("cookie-parser");
const { guestId } = require("./middlewares/guestId");
const settingsLoader = require("./helpers/settings");
const PORT = process.env.PORT || 5000;
const { errorHandler, error404 } = require("./middlewares/error");

//AppConfig loader
settingsLoader().then(() => {
  //App
  const app = express();

  //Cookie
  app.use(cookieParser());
  app.use(guestId);

  //Parsers
  app.use(express.json());

  //Language
  const i18next = require("./i18next");
  const i18n = require("i18next-http-middleware");
  const languegeSetter = require("./middlewares/language");
  app.use(i18n.handle(i18next));
  app.use(languegeSetter);

  //Routes
  const auth = require("./routes/auth");
  const products = require("./routes/product");
  const specials = require("./routes/specials");
  const filters = require("./routes/filters");
  const categories = require("./routes/categories");
  const cart = require("./routes/cart");
  const checkout = require("./routes/checkout");
  const address = require("./routes/address");
  const settings = require("./routes/settings");

  app.use("/api/v1/auth", auth);
  app.use("/api/v1/products", products);
  app.use("/api/v1/products", specials);
  app.use("/api/v1/filters", filters);
  app.use("/api/v1/categories", categories);
  app.use("/api/v1/cart", cart);
  app.use("/api/v1/checkout", checkout);
  app.use("/api/v1/address", address);
  app.use("/api/v1/config", settings);

  //Error handlers
  app.use(error404);
  app.use(errorHandler);

  app.listen(PORT, () => console.log(`RUNNING ON ${PORT}`));
});
