const express = require("express");
const router = express.Router();

const {
  createFeedingLogsController,
  getAllFeedingLogsController,
  getFeedingLogByIdController,
  editFeedingLogsController,
  deleteLogsController,
  restoreLogsController,
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

router.patch(
  "/:feeding_log_id/delete",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  deleteLogsController,
);

router.patch(
  "/:feeding_log_id/restore",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  restoreLogsController,
);

module.exports = router;
