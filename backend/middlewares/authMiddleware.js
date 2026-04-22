const jwt = require("jsonwebtoken");
const SECRET = "secret";

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "No token" });
    }

    // 🔥 Extract token properly
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({ msg: "Invalid token" });
  }
};