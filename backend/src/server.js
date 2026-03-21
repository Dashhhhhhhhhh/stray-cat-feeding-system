require("dotenv").config();

const express = require("express");
const app = express();

const authenticateJWT = require("../src/middleware/auth.middleware");
const authorizeRoles = require("../src/middleware/authorizeRoles");

app.use(express.json());
const PORT = process.env.PORT || 5000;

const authRoutes = require("./modules/auth/auth.routes");
const areaRoutes = require("./modules/areas/area.routes");
const feedingLogsRoutes = require("./modules/Feeding_Logs/feeding_logs.routes");
const supplyRoutes = require("./modules/Supplies/supplies.routes");

app.use("/auth", authRoutes);
app.use("/areas", areaRoutes);
app.use("/feeding-logs", feedingLogsRoutes);
app.use("/supplies", supplyRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Test route for role-based access
app.get(
  "/test-route",
  authenticateJWT, // first check: token must be valid
  authorizeRoles(["admin", "feeder"]), // second check: only admin or feeder roles allowed
  (req, res) => {
    res.json({
      success: true,
      message: `Access granted to ${req.user.role}`,
      user: req.user,
    });
  },
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
