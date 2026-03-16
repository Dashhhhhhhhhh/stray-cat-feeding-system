const {
  registerAuthService,
  loginAuthService,
  getMeService,
} = require("./auth.service");

async function registerAuthController(req, res) {
  try {
    const result = await registerAuthService(req.body);

    if (!result.success) {
      if (result.code === "DUPLICATE_EMAIL") {
        return res.status(409).json(result);
      }
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function loginAuthController(req, res) {
  try {
    const result = await loginAuthService(req.body);

    if (!result.success) {
      if (result.code === "INVALID_CREDENTIALS") {
        return res.status(401).json(result);
      }
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
}

async function getMeController(req, res) {
  try {
    const result = await getMeService(req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching User:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during fetch",
    });
  }
}

module.exports = {
  registerAuthController,
  loginAuthController,
  getMeController,
};
