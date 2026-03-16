const express = require("express");
const router = express.Router();

const authenticateJWT = require("../../../src/middleware/auth.middleware");
const {
  registerAuthController,
  loginAuthController,
  getMeController,
} = require("./auth.controller");

router.post("/register", registerAuthController);
router.post("/login", loginAuthController);

router.get("/me", authenticateJWT, getMeController);

module.exports = router;
