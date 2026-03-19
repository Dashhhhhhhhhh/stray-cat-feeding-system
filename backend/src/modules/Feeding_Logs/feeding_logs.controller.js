const {
  createFeedingLogsService,
  getAllFeedingLogsService,
  getFeedingLogByIdService,
  editFeedingLogsService,
  deleteLogsService,
  restoreLogsService,
} = require("./feeding_logs.service");

async function createFeedingLogsController(req, res) {
  try {
    const payload = req.body;
    const finalPayload = {
      ...payload,
      fed_by_user_id: req.user.id,
    };

    const result = await createFeedingLogsService(finalPayload);

    if (!result.success) {
      const statusMap = {
        MISSING_REQUIRED_FIELDS: 400,
        INVALID_ID: 400,
        INVALID_DATE: 400,
        NOT_FOUND: 404,
        INVALID_QUANTITY: 400,
        INVALID_QUANTITY_UNIT: 400,
        INVALID_NOTES: 400,
      };

      const status = statusMap[result.code] || 500;
      return res.status(status).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating feeding log:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function getAllFeedingLogsController(req, res) {
  try {
    const result = await getAllFeedingLogsService(req.body);

    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all feeding log:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function getFeedingLogByIdController(req, res) {
  try {
    const result = await getFeedingLogByIdService(req.params.feeding_log_id);

    if (!result.success) {
      if (result.code === "NOT_FOUND") {
        return res.status(404).json(result);
      }
      if (result.code === "INVALID_ID") {
        return res.status(400).json(result);
      }
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching feeding log:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function editFeedingLogsController(req, res) {
  try {
    const { feeding_log_id } = req.params;
    const payload = req.body.payload || req.body;

    const result = await editFeedingLogsService(feeding_log_id, payload);

    if (!result.success) {
      const statusMap = {
        INVALID_FEEDING_LOG_ID: 400,
        INVALID_AREA_ID: 400,
        INVALID_DATE: 400,
        INVALID_FEEDING_TYPE_ID: 400,
        INVALID_QUANTITY: 400,
        INVALID_QUANTITY_UNIT: 400,
        INVALID_NOTES: 400,
        EMPTY_UPDATE: 400,
        FEEDING_LOG_NOT_FOUND: 404,
        AREA_NOT_FOUND: 404,
        FEEDING_TYPE_NOT_FOUND: 404,
      };

      const status = statusMap[result.code] || 400;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching feeding log:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

async function deleteLogsController(req, res) {
  try {
    const result = await deleteLogsService(req.params.feeding_log_id);
    const statusMap = {
      INVALID_FEEDING_LOG_ID: 400,
      FEEDING_LOG_NOT_FOUND: 404,
      ALREADY_DELETED: 409,
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

async function restoreLogsController(req, res) {
  try {
    const result = await restoreLogsService(req.params.feeding_log_id);
    const statusMap = {
      INVALID_FEEDING_LOG_ID: 400,
      FEEDING_LOG_NOT_FOUND: 404,
      ALREADY_ACTIVE: 409,
    };
    if (!result.success) {
      const status = statusMap[result.code] || 400;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error resotring feeding log:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}
module.exports = {
  createFeedingLogsController,
  getAllFeedingLogsController,
  getFeedingLogByIdController,
  editFeedingLogsController,
  deleteLogsController,
  restoreLogsController,
};
