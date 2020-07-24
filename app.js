const express = require("express");
const PORT = 5000;
const errorHandler = require("./middlewares/error");
const app = express();

//Parsers
app.use(express.json());

//Language
const i18next = require("./i18next");
const i18n = require("i18next-http-middleware");
app.use(i18n.handle(i18next));

//Routes
const products = require("./routes/product");
const settings = require("./routes/settings");

app.use("/api/v1", products);
app.use("/api/v1", settings);

//Error handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`RUNNING ON ${PORT}`));
