const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      code: "TOKEN_MISSING",
      message: "Access token missing.",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(400).json({
      success: false,
      code: "INVALID_FORMAT",
      message: "Authorization header must be in Bearer format",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_INVALID",
        message: "Invalid or expired token",
      });
    }

    req.user = decoded;

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        code: "MISSING_USER_ID",
        message: "Unauthorized: No user ID in token",
      });
    }

    if (!req.user.email) {
      return res.status(401).json({
        success: false,
        code: "MISSING_EMAIL",
        message: "Unauthorized: No email in token",
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        code: "MISSING_ROLE",
        message: "Forbidden: No role assigned",
      });
    }

    next();
  });
}

module.exports = authenticateJWT;
