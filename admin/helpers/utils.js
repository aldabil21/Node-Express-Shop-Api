exports.getHost = (req) => {
  return req.protocol + "://" + req.get("host");
};
