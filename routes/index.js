const express = require("express");
const router = express.Router();
const path = require("path");

//User Routes
const auth = require("./auth");
const products = require("./product");
const cart = require("./cart");
const point = require("./point");
const checkout = require("./checkout");
const address = require("./address");
const settings = require("./settings");
const card = require("./card");

// router.get("/", (req, res) =>
//   res.sendFile(path.join(__dirname, "..", "client", "index.html"))
// );
router.use("/auth", auth);
router.use("/products", products);
router.use("/points", point);
router.use("/cart", cart);
router.use("/checkout", checkout);
router.use("/address", address);
router.use("/config", settings);
router.use("/card", card);

module.exports = router;
