const crypto = require("crypto");

const options = {
  expires: new Date(Date.now() + 24 * 7 * 60 * 60 * 1000), //A week
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const guestId = async (req, res, next) => {
  if (!req.cookies.guest && !req.cookies.token) {
    const random = crypto.randomBytes(256).toString("hex");
    const guestId = crypto.createHash("sha256").update(random).digest("hex");
    req.guest = guestId;

    res.cookie("guest", guestId, options);
  } else if (req.cookies.token) {
    res.clearCookie("guest");
    // req.user = req.cookies.token;
  } else {
    req.guest = req.cookies.guest;
    res.cookie("guest", req.cookies.guest, options);
  }
  next();
};

module.exports = guestId;
