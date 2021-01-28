const express = require("express");
const router = express.Router();
const {
  getQuotationSettings,
  getSheet,
  getSheets,
  addSheet,
  updateSheet,
  deleteSheet,
  switchSheetStatus,
} = require("../controllers/quotation");

const authorize = require("../middlewares/authorize");
const { sheetSchema } = require("../validators/quotation");

router.use(authorize(["Owner", "Administrator"]));

// @route    GET
// @access   ADMIN
// @desc     Get Quotation Settings
router.get("/settings", getQuotationSettings);

/**
 * Sheets Routes
 */
// @route    GET
// @access   ADMIN
// @desc     Get Sheets List
router.get("/settings/sheet", getSheets);
// @route    GET
// @access   ADMIN
// @desc     Get Sheet By ID
router.get("/settings/sheet/:id", getSheet);
// @route    POST
// @access   ADMIN
// @desc     Add New Sheet
router.post("/settings/sheet", sheetSchema, addSheet);
// @route    PUT
// @access   ADMIN
// @desc     Update Sheet by ID
router.put("/settings/sheet/:id", sheetSchema, updateSheet);
// @route    DELETE
// @access   ADMIN
// @desc     DELETE Sheet By ID
router.delete("/settings/sheet/:id", deleteSheet);
// @route    PATCH
// @access   ADMIN
// @desc     Switch Sheet Status
router.patch("/settings/sheet/:id", switchSheetStatus);

module.exports = router;
