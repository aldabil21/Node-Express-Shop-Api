const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrder,
  addHistory,
  //   deleteOrder,
  getStatuses,
} = require("../controllers/orders");
const authorize = require("../middlewares/authorize");
const { queryValidator, historyValidator } = require("../validators/order");

router.use(authorize(["Owner", "Administrator", "Manager", "Seller"]));

//@route    GET
//@access   ADMIN
//@desc     GET All Order Statuses
router.get("/statuses", queryValidator, getStatuses);

//@route    GET
//@access   ADMIN
//@desc     GET All orders
router.get("/", getAllOrders);

//@route    GET
//@access   ADMIN
//@desc     GET Order by ID
router.get("/:id", getOrder);

//@route    PATCH
//@access   ADMIN
//@desc     Add order history
router.post("/:id/history", historyValidator, addHistory);

// //@route    DELETE
// //@access   ADMIN
// //@desc     Delete Order
// router.delete("/:id", deleteOrder);

module.exports = router;
