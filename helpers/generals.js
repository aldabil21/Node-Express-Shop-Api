exports.strToBoolaen = (value) => {
  if (value && value.trim().toLowerCase() === "true") {
    return true;
  }
  return false;
};
