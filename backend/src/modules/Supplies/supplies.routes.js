const express = require("express");
const router = express.Router();

const {
  createSupplyController,
  getAllSupplyController,
  getSupplyByIdController,
  editSupplyController,
  deleteSupplyController,
  restoreSupplyController,
} = require("./supplies.controller");

const authenticateJWT = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/authorizeRoles");

router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  createSupplyController,
);

router.get(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  getAllSupplyController,
);

router.get(
  "/:supply_id",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  getSupplyByIdController,
);

router.patch(
  "/:supply_id",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  editSupplyController,
);

router.patch(
  "/:supply_id/delete",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  deleteSupplyController,
);

router.patch(
  "/:supply_id/restore",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  restoreSupplyController,
);

module.exports = router;
