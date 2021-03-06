const Product = require("../models/product");
const Taxonomy = require("../models/taxonomy");
const { i18next } = require("../../i18next");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   ADMIN
//@desc     GET Product By ID
exports.getProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.getProduct(id);

    if (!product) {
      throw new ErrorResponse(
        404,
        i18next.t("product:product_not_found", { product: id })
      );
    }
    res.status(200).json({ success: true, data: product });
    //Internal: add view count
    Product.addViewCount(product.product_id, product.view);
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET All Products
exports.getProducts = async (req, res, next) => {
  const {
    category,
    filter,
    special,
    page,
    perPage,
    sort,
    direction,
    q,
  } = req.query;

  const data = {
    category: category || "",
    filter: filter || "",
    special: special,
    page: page || 1,
    perPage: perPage || 20,
    sort,
    direction: direction || "DESC",
    q,
  };

  try {
    const products = await Product.getProducts(data);
    const totalCount = await Product.getTotalProducts(data);

    //Categories
    const categories = await Taxonomy.getAllRaw({ type: "product_category" });
    //Filters
    const filters = await Taxonomy.getAllRaw({ type: "product_filter" });

    const pagination = {
      totalCount,
      currentPage: data.page,
      perPage: data.perPage,
      totalPages: Math.ceil(totalCount / data.perPage),
    };
    res.status(200).json({
      success: true,
      data: { products, categories, filters, pagination },
    });
  } catch (err) {
    next(err);
  }
};

//@route    POST
//@access   ADMIN
//@desc     Add Products
exports.addProduct = async (req, res, next) => {
  try {
    const { body } = req;
    ErrorResponse.validateRequest(req);
    const product = await Product.addProduct(body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

//@route    PUT
//@access   ADMIN
//@desc     Update Products
exports.updateProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { body } = req;

    ErrorResponse.validateRequest(req);
    const product = await Product.updateProduct(body, id);

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

//@route    DELETE
//@access   ADMIN
//@desc     delete Product by id
exports.deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedId = await Product.deleteProduct(id);
    res.status(200).json({ success: true, data: deletedId });
  } catch (err) {
    next(err);
  }
};

//@route    GET
//@access   ADMIN
//@desc     GET All products (raw auto-complete)
exports.rawAutocomplete = async (req, res, next) => {
  const { q } = req.query;
  try {
    const products = await Product.getAllRaw(q);
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

//@route    PATCH
//@access   ADMIN
//@desc     Switch product status
exports.switchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const _status = await Product.switchStatus(id, status);
    res.status(200).json({ success: true, data: _status });
  } catch (err) {
    next(err);
  }
};
