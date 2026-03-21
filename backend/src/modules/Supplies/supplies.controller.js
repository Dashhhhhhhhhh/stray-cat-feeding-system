const {
  createSupplyService,
  getAllSupplyService,
  getSupplyByIdService,
  editSupplyService,
  deleteSupplyService,
  restoreSupplyService,
} = require("./supplies.service");

async function createSupplyController(req, res) {
  try {
    const result = await createSupplyService(req.body);

    if (!result.success) {
      const statusMap = {
        MISSING_REQUIRED_FIELDS: 400,
        INVALID_NAME: 400,
        SUPPLY_ALREADY_EXISTS: 409,
        INVALID_CATEGORY: 400,
        INVALID_TYPE: 400,
        INVALID_UNIT: 400,
        INVALID_QUANTITY: 400,
        INVALID_STOCK_LEVEL: 400,
        INVALID_NOTES: 400,
        NOT_FOUND: 404,
        INVALID_ID: 400,
        INVALID_DATE: 400,
      };

      const status = statusMap[result.code] || 500;
      return res.status(status).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating supplies:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function getAllSupplyController(req, res) {
  try {
    const result = await getAllSupplyService(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error fetching all supplies:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function getSupplyByIdController(req, res) {
  try {
    const result = await getSupplyByIdService(req.params.supply_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error fetching supply:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function editSupplyController(req, res) {
  try {
    const payload = req.body.payload || req.body;
    const result = await editSupplyService(req.params.supply_id, payload);

    if (!result.success) {
      const statusMap = {
        INVALID_SUPPLY_ID: 400,
        SUPPLY_NOT_FOUND: 404,
        INVALID_NAME: 400,
        SUPPLY_ALREADY_EXISTS: 400,
        INVALID_CATEGORY: 400,
        INVALID_TYPE: 400,
        INVALID_UNIT: 400,
        INVALID_QUANTITY: 400,
        INVALID_STOCK_LEVEL: 400,
        NO_FIELDS_TO_UPDATE: 400,
      };

      const status = statusMap[result.code] || 400;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching supply:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function deleteSupplyController(req, res) {
  try {
    const result = await deleteSupplyService(req.params.supply_id);
    const statusMap = {
      INVALID_ID: 400,
      NOT_FOUND: 404,
      ALREADY_DELETED: 400,
    };

    if (!result.success) {
      const status = statusMap[result.code] || 400;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting feeding log:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function restoreSupplyController(req, res) {
  try {
    const result = await restoreSupplyService(req.params.supply_id);
    const statusMap = {
      INVALID_ID: 400,
      NOT_FOUND: 404,
      ALREADY_ACTIVE: 400,
    };

    if (!result.success) {
      const status = statusMap[result.code] || 400;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting feeding log:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

module.exports = {
  createSupplyController,
  getAllSupplyController,
  getSupplyByIdController,
  editSupplyController,
  deleteSupplyController,
  restoreSupplyController,
};
