const {
  createFeedingLogs,
  findFeedingTypeById,
  getAllFeedingLogs,
  getFeedingLogById,
  editFeedingLogs,
  deleteLogs,
  restoreLogs,
  getFindDeledLogsById,
} = require("./feeding_logs.repository");

const { getAreasById } = require("../areas/areas.repository.js");

const {
  cleanString,
  isValidUUID,
  isValidDate,
  isValidQuantity,
  normalizeUnit,
  getExpectedUnit,
} = require("../../helpers.js");

async function createFeedingLogsService(feedingData) {
  const {
    area_id,
    fed_by_user_id,
    feeding_time,
    feeding_type_id,
    quantity,
    quantity_unit,
    notes,
  } = feedingData;

  if (
    !area_id ||
    !fed_by_user_id ||
    !feeding_time ||
    !feeding_type_id ||
    !quantity ||
    !quantity_unit
  ) {
    return {
      success: false,
      code: "MISSING_REQUIRED_FIELDS",
      message: "One or more required fields are missing.",
    };
  }

  if (!isValidUUID(area_id))
    return { success: false, code: "INVALID_ID", message: "Invalid UUID." };

  if (!isValidUUID(fed_by_user_id))
    return { success: false, code: "INVALID_ID", message: "Invalid UUID." };

  if (!isValidDate(feeding_time)) {
    return {
      success: false,
      code: "INVALID_DATE",
      message: "The provided feeding_time is not a valid date.",
    };
  }

  if (!isValidUUID(feeding_type_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid UUID format.",
    };
  }

  const feedingType = await findFeedingTypeById(feeding_type_id);

  if (!feedingType) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Feeding type does not exist.",
    };
  }

  if (!isValidQuantity(quantity)) {
    return {
      success: false,
      code: "INVALID_QUANTITY",
      message: "Quantity must be greater than 0.",
    };
  }

  const normalizedUnit = normalizeUnit(quantity_unit);
  function getExpectedUnit(feedingTypeName) {
    const mapping = {
      "dry food": "g",
      "wet food": "sachet",
      treats: "piece",
    };
    return mapping[feedingTypeName.toLowerCase()] || null;
  }

  const expectedUnit = getExpectedUnit(feedingType.feeding_type_name);

  if (normalizedUnit !== expectedUnit) {
    return {
      success: false,
      code: "INVALID_QUANTITY_UNIT",
      message: `Expected unit '${expectedUnit}' for feeding type '${feedingType.feeding_type_name}'.`,
    };
  }

  const note = cleanString(notes);
  if (note && note.length > 500) {
    return {
      success: false,
      code: "INVALID_NOTES",
      message: "Notes is too long (max 500 characters).",
    };
  }

  const feedingLogs = await createFeedingLogs({
    area_id,
    fed_by_user_id,
    feeding_time,
    feeding_type_id,
    quantity,
    quantity_unit: normalizedUnit,
    notes: note,
  });

  return {
    success: true,
    message: "Feeding log created successfully.",
    data: {
      feeding_log_id: feedingLogs.feeding_log_id,
      area_id,
      fed_by_user_id,
      feeding_time,
      feeding_type_id,
      quantity,
      quantity_unit: normalizedUnit,
      notes: note,
    },
  };
}

async function getAllFeedingLogsService(query) {
  let { page, pageSize, sortBy, sortOrder, is_deleted } = query;

  page = Number(page);
  pageSize = Number(pageSize);

  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    pageSize = 10;
  }

  const allowedSortColumns = ["feeding_time", "created_at"];
  sortBy = allowedSortColumns.includes(sortBy) ? sortBy : "feeding_time";

  sortOrder = typeof sortOrder === "string" ? sortOrder.toUpperCase() : "DESC";
  sortOrder = sortOrder === "ASC" ? "ASC" : "DESC";

  if (is_deleted === "true") {
    is_deleted = true;
  } else if (is_deleted === "false") {
    is_deleted = false;
  } else {
    is_deleted = false;
  }

  const feedingLogs = await getAllFeedingLogs({
    page,
    pageSize,
    sortBy,
    sortOrder,
    is_deleted,
  });

  return {
    success: true,
    message: "Feeding logs retrieved successfully.",
    data: feedingLogs,
    meta: {
      page,
      pageSize,
      sortBy,
      sortOrder,
      is_deleted,
    },
  };
}

async function getFeedingLogByIdService(feeding_log_id) {
  if (!isValidUUID(feeding_log_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid UUID format.",
    };
  }

  const logs = await getFeedingLogById(feeding_log_id);

  if (!logs) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Feeding log not found.",
    };
  }

  return {
    success: true,
    message: "Feeding log retrieved successfully.",
    data: logs,
  };
}

async function editFeedingLogsService(feeding_log_id, payload) {
  if (!isValidUUID(feeding_log_id)) {
    return {
      success: false,
      code: "INVALID_FEEDING_LOG_ID",
      message: "Invalid UUID format for feeding_log_id.",
    };
  }

  const existingLog = await getFeedingLogById(feeding_log_id);
  if (!existingLog) {
    return {
      success: false,
      code: "FEEDING_LOG_NOT_FOUND",
      message: "Feeding log not found.",
    };
  }

  const update = {};
  let feedingType = null;

  if (payload.area_id) {
    if (!isValidUUID(payload.area_id)) {
      return {
        success: false,
        code: "INVALID_AREA_ID",
        message: "Invalid UUID format for area_id.",
      };
    }

    const area = await getAreasById(payload.area_id);
    if (!area) {
      return {
        success: false,
        code: "AREA_NOT_FOUND",
        message: "Area does not exist.",
      };
    }

    update.area_id = payload.area_id;
  }

  if (payload.feeding_time) {
    if (!isValidDate(payload.feeding_time)) {
      return {
        success: false,
        code: "INVALID_DATE",
        message: "The provided feeding_time is not a valid date.",
      };
    }
    update.feeding_time = payload.feeding_time;
  }

  if (payload.feeding_type_id) {
    if (!isValidUUID(payload.feeding_type_id)) {
      return {
        success: false,
        code: "INVALID_FEEDING_TYPE_ID",
        message: "Invalid UUID format for feeding_type_id.",
      };
    }

    feedingType = await findFeedingTypeById(payload.feeding_type_id);
    if (!feedingType) {
      return {
        success: false,
        code: "FEEDING_TYPE_NOT_FOUND",
        message: "Feeding type does not exist.",
      };
    }

    update.feeding_type_id = payload.feeding_type_id;
  }

  if (payload.quantity !== undefined) {
    if (!isValidQuantity(payload.quantity)) {
      return {
        success: false,
        code: "INVALID_QUANTITY",
        message: "Quantity must be greater than 0.",
      };
    }
    update.quantity = payload.quantity;
  }

  if (payload.quantity_unit) {
    const normalizedUnit = normalizeUnit(payload.quantity_unit);

    if (!feedingType) {
      feedingType = await findFeedingTypeById(existingLog.feeding_type_id);
      if (!feedingType) {
        return {
          success: false,
          code: "FEEDING_TYPE_NOT_FOUND",
          message: "Feeding type does not exist.",
        };
      }
    }

    const expectedUnit = getExpectedUnit(feedingType.feeding_type_name);

    if (expectedUnit && normalizedUnit !== expectedUnit) {
      return {
        success: false,
        code: "INVALID_QUANTITY_UNIT",
        message: `Expected unit '${expectedUnit}' for feeding type '${feedingType.feeding_type_name}'.`,
      };
    }

    update.quantity_unit = normalizedUnit;
  }

  if (payload.notes !== undefined) {
    const note = cleanString(payload.notes);
    if (note && note.length > 500) {
      return {
        success: false,
        code: "INVALID_NOTES",
        message: "Notes is too long (max 500 characters).",
      };
    }
    update.notes = note;
  }

  if (Object.keys(update).length === 0) {
    return {
      success: false,
      code: "EMPTY_UPDATE",
      message: "At least one field is required for update.",
    };
  }

  const updatedLog = await editFeedingLogs(feeding_log_id, update);

  if (!updatedLog) {
    return {
      success: false,
      code: "FEEDING_LOG_NOT_FOUND",
      message: "Feeding log not found.",
    };
  }

  return {
    success: true,
    message: "Feeding log updated successfully.",
    data: updatedLog,
  };
}

async function deleteLogsService(feeding_log_id) {
  if (!isValidUUID(feeding_log_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid feeding log ID.",
    };
  }

  const logs = await getFeedingLogById(feeding_log_id);

  if (!logs) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Feeding log not found.",
    };
  }

  if (logs.is_deleted) {
    return {
      success: false,
      code: "ALREADY_DELETED",
      messa: "Feeding log already deleted.",
    };
  }

  const result = await deleteLogs(feeding_log_id);

  return {
    success: true,
    message: "Feeding log successfully deleted.",
  };
}

async function restoreLogsService(feeding_log_id) {
  if (!isValidUUID(feeding_log_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid feeding log ID.",
    };
  }

  const logs = await getFindDeledLogsById(feeding_log_id);

  if (!logs) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Feeding log not found.",
    };
  }

  if (!logs.is_deleted) {
    return {
      success: false,
      code: "ALREADY_DELETED",
      messa: "Feeding log already active.",
    };
  }

  const result = await restoreLogs(feeding_log_id);

  return {
    success: true,
    message: "Feeding log successfully restored.",
    data: result,
  };
}

module.exports = {
  createFeedingLogsService,
  getAllFeedingLogsService,
  getFeedingLogByIdService,
  editFeedingLogsService,
  deleteLogsService,
  restoreLogsService,
};
