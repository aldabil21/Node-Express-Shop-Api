const Languages = require("../models/languages");
const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");

// @route    GET
// @access   ADMIN
// @desc     Get Languages
exports.getLanguages = async (req, res, next) => {
  try {
    const languages = await Languages.getLanguages();

    res.status(200).json({ sucess: true, data: languages });
  } catch (err) {
    next(err);
  }
};

// @route    GET
// @access   ADMIN
// @desc     Get Language by ID
exports.getLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const language = await Languages.getById(id);
    if (!language) {
      throw new ErrorResponse(
        404,
        i18next.t("settings:language_not_found", { id: id })
      );
    }
    res.status(200).json({ sucess: true, data: language });
  } catch (err) {
    next(err);
  }
};

// @route    POST
// @access   ADMIN
// @desc     Add Languages
exports.addLanguage = async (req, res, next) => {
  try {
    const data = req.body;
    ErrorResponse.validateRequest(req);

    const languages = await Languages.addLanguage(data);

    res.status(200).json({ sucess: true, data: languages });
  } catch (err) {
    next(err);
  }
};

// @route    PUT
// @access   ADMIN
// @desc     Update Language
exports.updateLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = {
      id,
      ...req.body,
    };
    ErrorResponse.validateRequest(req);

    if (data.status === 0) {
      await Languages.checkLeastOneEnabled();
    }

    const languages = await Languages.updateLanguage(data);

    res.status(200).json({ sucess: true, data: languages });
  } catch (err) {
    next(err);
  }
};

// @route    DELETE
// @access   ADMIN
// @desc     Delete Language
exports.deleteLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Languages.validateDelete(id);

    const deletedId = await Languages.delete(id);

    res.status(200).json({ sucess: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch language status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === 0) {
      await Languages.checkLeastOneEnabled();
    }

    const languages = await Languages.switchStatus(id, status);
    res.status(200).json({ success: true, data: languages });
  } catch (err) {
    next(err);
  }
};
