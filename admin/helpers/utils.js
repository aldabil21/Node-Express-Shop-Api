exports.getHost = (req) => {
  return req.protocol + "://" + req.get("host");
};
exports.getStaticHost = (req) => {
  return req.protocol + "://" + req.get("host") + "/api";
};
exports.getadminHost = (req) => {
  return req.protocol + "://" + req.get("host") + "/admin";
};
