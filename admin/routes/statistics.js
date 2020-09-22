const express = require("express");
const router = express.Router();
const {
  getNumbers,
  getCharts,
  getRanks,
} = require("../controllers/statistics");

const authorize = require("../middlewares/authorize");

router.use(authorize(["Owner", "Administrator"]));

//@route    GET
//@access   ADMIN
//@desc     Get Nubmers Statistics (total orders/need action/neglected carts, total sales, total customes, total discounts)
router.get("/numbers", getNumbers);

//@route    GET
//@access   ADMIN
//@desc     Get Chart Statistics (Sales & order countries per year/month/week)
router.get("/charts", getCharts);

//@route    GET
//@access   ADMIN
//@desc     Get Rank Statistics (most viewed products, most ordered products)
router.get("/ranks", getRanks);

module.exports = router;
