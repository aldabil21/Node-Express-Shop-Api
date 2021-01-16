const Product = require("../models/product");
const { i18next } = require("../i18next");
const ErrorResponse = require("../helpers/error");

//@route    GET
//@access   PUBLIC
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
//@access   PUBLIC
//@desc     GET All Products
exports.getProducts = async (req, res, next) => {
  const {
    category,
    filter,
    special,
    page = 1,
    perPage = 20,
    sort = "view",
    direction = "DESC",
    q = "",
  } = req.query;

  const filters = {
    language: req.language,
    category,
    filter,
    special: special,
    page,
    perPage,
    sort,
    direction,
    q,
  };

  try {
    const products = await Product.getProducts(filters);
    const totalCount = await Product.getTotalProducts(filters);
    const pagination = {
      totalCount,
      currentPage: +page,
      perPage: +perPage,
      totalPages: Math.ceil(totalCount / perPage),
    };
    res.status(200).json({ success: true, data: { products, pagination } });
  } catch (err) {
    next(err);
  }
};
