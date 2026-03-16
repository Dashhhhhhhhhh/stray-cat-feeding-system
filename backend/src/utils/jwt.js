const jwt = require("jsonwebtoken");

function generateToken({ id, email, role }) {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

module.exports = { generateToken };
