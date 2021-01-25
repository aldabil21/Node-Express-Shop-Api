const { query } = require("express-validator");

exports.galleryGet = [
  query("id")
    .toInt()
    .customSanitizer((value) => (value > 0 ? value : 0)),
  query("category").customSanitizer((value) => (value ? value.split(",") : [])),
  query("tag").customSanitizer((value) => (value ? value.split(",") : [])),
  query("q").customSanitizer((value) => value || ""),
  query("page").customSanitizer((value) => (value > 0 ? value : 1)),
  query("perPage").customSanitizer((value) => (value > 0 ? value : 20)),
  query("sort").customSanitizer((value) => value || "date_added"),
  query("direction").customSanitizer((value) => value || "ASC"),
];
