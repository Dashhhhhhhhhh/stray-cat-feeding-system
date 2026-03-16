const {
  createArea,
  findAreaByName,
  getAllAreas,
  getAreasById,
  editAreas,
  softDeleteAreas,
  restoreAreas,
} = require("./areas.repository");

const { cleanString, isValidUUID } = require("../../helpers.js");

async function createAreaService(areaData) {
  const { area_name, location_description } = areaData;

  const areaName = cleanString(area_name);
  if (areaName && areaName.length > 50) {
    return {
      success: false,
      code: "INVALID_NAME",
      message: "Area name is too long (max 50 characters).",
    };
  }

  if (!areaName) {
    return { success: false, message: "Required field must be provided." };
  }

  const locationDescription = cleanString(location_description);
  if (locationDescription && locationDescription.length > 150) {
    return {
      success: false,
      code: "INVALID_DESCRIPTION",
      message: "Location description is too long (max 150 characters).",
    };
  }

  const existingArea = await findAreaByName(areaName);
  if (existingArea) {
    return {
      success: false,
      code: "DUPLICATE_AREA",
      message: "Area already exists",
    };
  }

  const area = await createArea({
    area_name: areaName,
    location_description: locationDescription,
  });

  return {
    success: true,
    message: "Area created",
    data: {
      area_id: area.area_id,
      area_name: area.area_name,
    },
  };
}

async function getAllAreasService() {
  const areas = await getAllAreas();

  return {
    success: true,
    message: "All areas retrieved successfully.",
    data: areas,
  };
}

async function getAreasByIdService(area_id) {
  if (!isValidUUID(area_id))
    return { success: false, code: "INVALID_ID", message: "Invalid UUID." };

  const area = await getAreasById(area_id);

  if (!area) {
    return {
      success: false,
      code: "AREA_NOT_FOUND",
      message: "The requested area could not be found.",
    };
  }
  return {
    success: true,
    message: "Area retrieved successfully",
    data: area,
  };
}

async function editAreasService(area_id, payload) {
  if (!isValidUUID(area_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid area ID.",
    };
  }

  const update = {};

  const currentArea = await getAreasById(area_id);
  if (!currentArea) {
    return {
      success: false,
      code: "AREA_NOT_FOUND",
      message: "Area not found.",
    };
  }

  if (payload.area_name) {
    const areaName = cleanString(payload.area_name);

    if (areaName.length > 50) {
      return {
        success: false,
        code: "INVALID_NAME",
        message: "Area name is too long (max 50 characters).",
      };
    }
    update.area_name = areaName;
  }

  if (update.area_name) {
    const duplicateArea = await findAreaByName(update.area_name);

    if (duplicateArea && duplicateArea.area_id !== currentArea.area_id) {
      return {
        success: false,
        code: "AREA_DUPLICATE",
        message: "Area already exists.",
      };
    }
  }

  if (payload.location_description) {
    const locationDescription = cleanString(payload.location_description);

    if (locationDescription.length > 150) {
      return {
        success: false,
        code: "INVALID_DESCRIPTION",
        message: "Location description is too long (max 150 characters).",
      };
    }
    update.location_description = locationDescription;
  }

  if (Object.keys(update).length === 0) {
    return {
      success: false,
      code: "EMPTY_UPDATE",
      message: "At least one field is required for update.",
    };
  }

  const finalPayload = {
    area_name: update.area_name
      ? update.area_name
      : (currentArea.area_name ?? ""),
    location_description: update.location_description
      ? update.location_description
      : (currentArea.location_description ?? ""),
  };

  const updatedArea = await editAreas(area_id, finalPayload);

  if (!updatedArea) {
    return {
      success: false,
      code: "AREA_NOT_FOUND",
      message: "The requested area could not be found.",
    };
  }

  return {
    success: true,
    message: "Area updated successfully.",
    data: updatedArea,
  };
}

async function softDeleteAreasService(area_id) {
  if (!isValidUUID(area_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid area ID.",
    };
  }

  const area = await getAreasById(area_id);

  if (!area) {
    return {
      success: false,
      code: "AREA_NOT_FOUND",
      message: "The requested area could not be found.",
    };
  }

  if (area.is_active === false) {
    return {
      success: false,
      code: "AREA_ALREADY_INACTIVE",
      message: "Area already deactivated.",
    };
  }

  const deactivatedArea = await softDeleteAreas(area_id);

  if (!deactivatedArea) {
    return {
      success: false,
      code: "DELETE_FAILED",
      message: "Failed to delete area or area not found.",
    };
  }

  return {
    success: true,
    message: "Area deactivated successfully.",
    data: deactivatedArea,
  };
}

async function restoreAreaService(area_id) {
  if (!isValidUUID(area_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid area ID.",
    };
  }

  const area = await getAreasById(area_id);

  if (!area) {
    return {
      success: false,
      code: "AREA_NOT_FOUND",
      message: "The requested area could not be found.",
    };
  }

  if (area.is_active === true) {
    return {
      success: true,
      code: "AREA_ALREADY_ACTIVE",
      message: "Area already Activated.",
    };
  }

  const reactivateArea = await restoreAreas(area_id);

  if (!reactivateArea) {
    return {
      success: false,
      code: "RESTORE_FAILED",
      message: "Failed to restore area or area not found.",
    };
  }

  return {
    success: true,
    message: "Area restored successfully.",
    data: reactivateArea,
  };
}

module.exports = {
  createAreaService,
  getAllAreasService,
  getAreasByIdService,
  editAreasService,
  softDeleteAreasService,
  restoreAreaService,
};
