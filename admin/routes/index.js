const express = require("express");
const router = express.Router();
const path = require("path");

const adminAtuh = require("./auth");
const adminProducts = require("./product");
const coupon = require("./coupon");
const specials = require("./specials");
const tax = require("./tax");
const attribute = require("./attribute");
const orders = require("./orders");
const users = require("./users");
const adminSettings = require("./settings");
const languages = require("./languages");
const shippings = require("./shipping");
const admins = require("./admins");
const profile = require("./profile");
const statistics = require("./statistics");
const media = require("./media");
const taxonomy = require("./taxonomy");

router.use("/auth", adminAtuh);
router.use("/products", adminProducts);
router.use("/products", specials);
router.use("/coupons", coupon);
router.use("/tax", tax);
router.use("/attributes", attribute);
router.use("/orders", orders);
router.use("/users", users);
router.use("/settings", adminSettings);
router.use("/languages", languages);
router.use("/shippings", shippings);
router.use("/admins", admins);
router.use("/profile", profile);
router.use("/statistics", statistics);
router.use("/media", media);
router.use("/taxonomy", taxonomy);
// router.get((req, res) =>
//   res.sendFile(path.join(__dirname, "..", "..", "dashboard", "index.html"))
// );

module.exports = router;
