const Categories = require("../models/categories");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

//@route    GET
//@access   ADMIN
//@desc     GET All categories (w pagination & auto-complete)
exports.getAllCategories = async (req, res, next) => {
  const {
    q = "",
    page = 1,
    perPage = 20,
    sort = "sort_order",
    direction = "ASC",
    expand = "",
  } = req.query;

  const data = {
    q,
    page,
    perPage,
    sort,
    direction,
    expand,
  };

  try {
    const categories = await Categories.getParentCategories(data);
    const totalCount = await Categories.getTotalCategories(data);
    let pagination;

    if (expand === "children") {
      //get category children
      //Add pagination only in expand mode, otherwise will only get all parents for select parent input
      if (categories.length) {
        for (const category of categories) {
          category.children = await Categories.getChildCategories(
            category.category_id
          );
        }
      }
      pagination = {
        totalCount,
        currentPage: +page,
        perPage: +perPage,
        totalPages: Math.ceil(totalCount / perPage),
      };
    }

    res.status(200).json({ success: true, data: { categories, pagination } });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET Category by ID
exports.getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Categories.getCategoryForEdit(id);

    if (!category) {
      throw new ErrorResponse(
        404,
        i18next.t("category:category_not_found", { id: id })
      );
    }

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Category
exports.addCategory = async (req, res, next) => {
  const data = req.body;
  try {
    ErrorResponse.validateRequest(req);
    data.image = req.file ? req.file.path : "images/no-photo-thumb.png";

    const category = await Categories.addCategory(data);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Category
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const data = {
      id,
      ...body,
    };
    ErrorResponse.validateRequest(req);

    const prev = JSON.parse(body.prevImg);
    const nothumb = "images/no-photo-thumb.png";
    let image = prev.length ? prev[0] : "";
    if (req.file) {
      image = req.file.path;
    }
    if (!image) {
      image = nothumb;
    }
    delete data.prevImg;
    data.image = image;

    const category = await Categories.updateCategory(data);
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     Delete category
exports.deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    // await Categories.getCategory(id, false);
    const deletedId = await Categories.deleteCategory(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET All categories (raw auto-complete)
exports.rawAutocomplete = async (req, res, next) => {
  const { q } = req.query;
  try {
    const categories = await Categories.getAllRaw(q);
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch category status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const _status = await Categories.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
