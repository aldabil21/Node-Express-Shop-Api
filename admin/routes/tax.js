const express = require("express");
const router = express.Router();
const {
  getTaxes,
  autocomplete,
  //   getTax,
  //   addTax,
  //   updateTax,
  //   deleteTax,
} = require("../controllers/tax");
const { taxSchema } = require("../validators/tax");
const authorize = require("../middlewares/authorize");

router.use(authorize);

//@route    GET
//@access   ADMIN
//@desc     Tax search/autocomplete
router.get("/autocomplete", autocomplete);

//@route    GET
//@access   ADMIN
//@desc     Get All Taxes
router.get("/", getTaxes);

// //@route    GET
// //@access   ADMIN
// //@desc     Get Tax by ID
// router.get("/", getTax);

// //@route    POST
// //@access   ADMIN
// //@desc     Add Tax
// router.post("/", taxSchema, addTax);

// //@route    PUT
// //@access   ADMIN
// //@desc     Update Tax
// router.put("/:id", taxSchema, updateTax);

// //@route    DELETE
// //@access   ADMIN
// //@desc     Delete Tax
// router.delete("/:id", deleteTax);

module.exports = router;
