const {
  createAreaService,
  getAllAreasService,
  getAreasByIdService,
  editAreasService,
  softDeleteAreasService,
  restoreAreaService,
} = require("./areas.service");

async function createAreaController(req, res) {
  try {
    const result = await createAreaService(req.body);

    if (!result.success) {
      if (result.code === "DUPLICATE_AREA") {
        return res.status(409).json(result);
      }
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating area:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function getAllAreasController(req, res) {
  try {
    const result = await getAllAreasService();

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error fetching areas:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getAreasByIdController(req, res) {
  try {
    const result = await getAreasByIdService(req.params.area_id);

    if (!result.success) {
      if (result.code === "INVALID_ID") {
        return res.status(400).json(result);
      }
      if (result.code === "AREA_NOT_FOUND") {
        return res.status(404).json(result);
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching area:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function editAreasController(req, res) {
  try {
    const result = await editAreasService(req.params.area_id, req.body);

    if (!result.success) {
      switch (result.code) {
        case "INVALID_ID":
        case "INVALID_NAME":
        case "INVALID_DESCRIPTION":
        case "EMPTY_UPDATE":
          return res.status(400).json(result);

        case "AREA_DUPLICATE":
          return res.status(409).json(result);

        case "AREA_NOT_FOUND":
          return res.status(404).json(result);

        default:
          return res.status(500).json(result);
      }
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating area:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function softDeleteAreasController(req, res) {
  try {
    const result = await softDeleteAreasService(req.params.area_id);

    if (!result.success) {
      const statusMap = {
        INVALID_ID: 400,
        AREA_NOT_FOUND: 404,
        AREA_ALREADY_INACTIVE: 409,
      };

      const status = statusMap[result.code] || 500;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deactivating area:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function restoreAreaController(req, res) {
  try {
    const result = await restoreAreaService(req.params.area_id);

    if (!result.success) {
      const statusMap = {
        INVALID_ID: 400,
        AREA_NOT_FOUND: 404,
        AREA_ALREADY_ACTIVE: 409,
      };

      const status = statusMap[result.code] || 500;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error reactivating area:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  createAreaController,
  getAllAreasController,
  getAreasByIdController,
  editAreasController,
  softDeleteAreasController,
  restoreAreaController,
};
