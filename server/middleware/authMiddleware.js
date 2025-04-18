const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "prashant@123"; // Use environment variable

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
