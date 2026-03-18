const express = require("express");
const router = express.Router();

const {
  createFeedingLogsController,
  getAllFeedingLogsController,
  getFeedingLogByIdController,
  editFeedingLogsController,
} = require("./feeding_logs.controller");

const authenticateJWT = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/authorizeRoles");

router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  createFeedingLogsController,
);

router.get(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  getAllFeedingLogsController,
);

router.get(
  "/:feeding_log_id",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  getFeedingLogByIdController,
);

router.patch(
  "/:feeding_log_id",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  editFeedingLogsController,
);

module.exports = router;
