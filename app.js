const express = require("express");
const PORT = process.env.PORT || 5050;
const { errorHandler, error404 } = require("./middlewares/error");
const app = express();

//Parsers
app.use(express.json());

//Language
const i18next = require("./i18next");
const i18n = require("i18next-http-middleware");
const languegeSetter = require("./middlewares/language");
app.use(i18n.handle(i18next));
app.use(languegeSetter);

//Routes
const products = require("./routes/product");
const specials = require("./routes/specials");
const filters = require("./routes/filters");
const settings = require("./routes/settings");

app.use("/api/v1/products", products);
app.use("/api/v1/products", specials);
app.use("/api/v1/filters", filters);
app.use("/api/v1", settings);

//Error handlers
app.use(error404);
app.use(errorHandler);

app.listen(PORT, () => console.log(`RUNNING ON ${PORT}`));
