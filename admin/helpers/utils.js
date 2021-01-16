exports.getHost = (req) => {
  return req.protocol + "://" + req.get("host");
};
exports.getStaticsHost = (req) => {
  return req.protocol + "://" + req.get("host") + "/api";
};
exports.getadminHost = (req) => {
  return req.protocol + "://" + req.get("host") + "/admin";
};
