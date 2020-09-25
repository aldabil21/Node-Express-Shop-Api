const Admins = require("../models/admin");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     Get All Admins
exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await Admins.getAdmins();

    res.status(200).json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     Get Admin by ID
exports.getAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await Admins.getAdmin(id);
    if (!admin) {
      throw new ErrorResponse(
        404,
        i18next.t("settings:admin_not_found", { id: id })
      );
    }
    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Admin
exports.addAdmin = async (req, res, next) => {
  try {
    ErrorResponse.validateRequest(req);

    const admin = await Admins.addAdmin(req.body);

    res.status(201).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Admin
exports.updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = {
      id,
      ...req.body,
    };
    const { admin, adminRole } = req;

    //Cannot switch self off
    const toBeUpdate = await Admins.findById(id);
    if (+toBeUpdate.admin_id === +admin && data.status === 0) {
      throw new ErrorResponse(403, i18next.t("settings:cannot_self_off"));
    }
    //Cannot play with Owner role except another Owner
    if (toBeUpdate.role === "Owner" && adminRole !== "Owner") {
      throw new ErrorResponse(403, i18next.t("settings:only_owners_allowed"));
    }
    ErrorResponse.validateRequest(req);
    const updated = await Admins.updateAdmin(data);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete Admin
exports.deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminRole, admin } = req;
    //Only owner delete owner
    const tobeDeleted = await Admins.findById(id);
    if (tobeDeleted.role === "Owner" && adminRole !== "Owner") {
      throw new ErrorResponse(403, i18next.t("settings:only_owners_allowed"));
    }
    //Cannot delete self
    if (+tobeDeleted.admin_id === +admin) {
      throw new ErrorResponse(403, i18next.t("settings:cannot_self_off"));
    }
    const deletedId = await Admins.deleteAdmin(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch Admin status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { adminRole, admin } = req;

    //Only owner switch owner
    const toBeSwitched = await Admins.findById(id);
    if (toBeSwitched.role === "Owner" && adminRole !== "Owner") {
      throw new ErrorResponse(403, i18next.t("settings:only_owners_allowed"));
    }
    //Cannot switch self off
    if (+toBeSwitched.admin_id === +admin && status === 0) {
      throw new ErrorResponse(403, i18next.t("settings:cannot_self_off"));
    }
    const _status = await Admins.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Reset password
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminRole } = req;

    //Only owner reset owner
    const tobeReset = await Admins.findById(id);
    if (tobeReset.role === "Owner" && adminRole !== "Owner") {
      throw new ErrorResponse(403, i18next.t("settings:only_owners_allowed"));
    }
    const result = await Admins.requestPasswordReset(tobeReset);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
