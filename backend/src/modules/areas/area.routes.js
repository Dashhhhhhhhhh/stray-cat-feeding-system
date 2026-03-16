const express = require("express");
const router = express.Router();

const {
  createAreaController,
  getAllAreasController,
  getAreasByIdController,
  editAreasController,
  softDeleteAreasController,
  restoreAreaController,
} = require("./area.controller");

const authenticateJWT = require("../../../src/middleware/auth.middleware");
const authorizeRoles = require("../../../src/middleware/authorizeRoles");

router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  createAreaController,
);

router.get(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  getAllAreasController,
);

router.get(
  "/:area_id",
  authenticateJWT,
  authorizeRoles("admin", "feeder"),
  getAreasByIdController,
);

router.patch(
  "/:area_id",
  authenticateJWT,
  authorizeRoles("admin"),
  editAreasController,
);

router.patch(
  "/:area_id/deactivate",
  authenticateJWT,
  authorizeRoles("admin"),
  softDeleteAreasController,
);

router.patch(
  "/:area_id/reactivate",
  authenticateJWT,
  authorizeRoles("admin"),
  restoreAreaController,
);
module.exports = router;
