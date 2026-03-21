const {
  createSupply,
  findSupplyByName,
  getAllSupplies,
  getSupplyById,
  findSupplyByNameExcludingId,
  editSupply,
  findSupplyById,
  deleteSupply,
  restoreSupply,
  getFindDeletedSupplyById,
} = require("./supplies.repository");

const {
  cleanString,
  normalizeUnit,
  normalizeStock,
  isValidUUID,
} = require("../../helpers.js");
const {
  getFeedingLogById,
} = require("../Feeding_Logs/feeding_logs.repository.js");

async function createSupplyService(supplyData) {
  const {
    supply_name,
    category,
    unit,
    quantity_in_stock,
    minimum_stock_level,
    notes,
    type,
  } = supplyData;

  if (!supply_name || !category || !unit) {
    return {
      success: false,
      code: "MISSING_REQUIRED_FIELDS",
      message: "One or more required fields are missing.",
    };
  }

  const normalizedSupply = cleanString(supply_name);

  if (normalizedSupply.length > 50) {
    return {
      success: false,
      code: "INVALID_NAME",
      message: "Supply name is too long (max 50 characters).",
    };
  }
  const existingSupplyName = await findSupplyByName(normalizedSupply);

  if (existingSupplyName) {
    return {
      success: false,
      code: "SUPPLY_ALREADY_EXISTS",
      message: "A supply with this name already exists.",
      data: null,
    };
  }

  const normalizedCategory = category.trim().toLowerCase().replace(/\s+/g, " ");

  const allowedCategories = [
    "food",
    "medicine",
    "cleaning",
    "equipment",
    "supplement",
  ];

  if (normalizedCategory && normalizedCategory.length > 50) {
    return {
      success: false,
      code: "INVALID_NAME",
      message: "Category is too long (max 50 characters).",
    };
  }

  if (!allowedCategories.includes(normalizedCategory)) {
    return {
      success: false,
      code: "INVALID_CATEGORY",
      message:
        "Category must be one of: food, medicine, cleaning, equipment, supplement.",
    };
  }

  let normalizedType = null;

  if (type) {
    normalizedType = cleanString(type);

    if (normalizedType.length > 50) {
      return {
        success: false,
        code: "INVALID_TYPE",
        message: "Type is too long (max 50 characters).",
      };
    }
  }

  const normalizedUnit = normalizeUnit(unit);
  if (!normalizedUnit) {
    return {
      success: false,
      code: "INVALID_UNIT",
      message:
        "Unit is not recognized. Allowed units are: g, kg, ml, l, can, bag, bottle, box, sachet, piece.",
    };
  }

  const normalizedQuantity = normalizeStock(quantity_in_stock);

  if (normalizedQuantity === null) {
    return {
      success: false,
      code: "INVALID_QUANTITY",
      message: "Stock level must be a non-negative number.",
    };
  }

  const normalizedMinimumStock = normalizeStock(minimum_stock_level);

  if (normalizedMinimumStock === null) {
    return {
      success: false,
      code: "INVALID_STOCK_LEVEL",
      message: "Stock level must be a non-negative number.",
    };
  }

  let normalizeNotes = null;
  if (notes) {
    normalizeNotes = cleanString(notes);
    if (normalizeNotes.length > 250) {
      return {
        success: false,
        code: "INVALID_NOTES",
        message: "Note is too long (max 250 characters).",
      };
    }
  }

  const supplies = await createSupply({
    supply_id: supplyData.supply_id,
    supply_name: normalizedSupply,
    category: normalizedCategory,
    unit: normalizedUnit,
    quantity_in_stock: normalizedQuantity,
    minimum_stock_level: normalizedMinimumStock,
    notes: normalizeNotes,
    type: normalizedType,
  });

  return {
    success: true,
    message: "Supply created successfully.",
    data: {
      supply_id: supplies.supply_id,
      supply_name: supplies.supply_name,
      category: supplies.category,
      type: supplies.type,
      unit: supplies.unit,
      quantity_in_stock: supplies.quantity_in_stock,
      minimum_stock_level: supplies.minimum_stock_level,
      notes: supplies.notes || null,
    },
  };
}

async function getAllSupplyService() {
  const supplies = await getAllSupplies();

  return {
    success: true,
    message: "All supplies retrieved successfully.",
    data: supplies,
  };
}

async function getSupplyByIdService(supply_id) {
  if (!isValidUUID(supply_id)) {
    return {
      success: false,
      code: "INVALID_SUPPLY_ID",
      message: "Invalid UUID format.",
    };
  }

  const supply = await getSupplyById(supply_id);

  if (!supply) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Supply log not found.",
    };
  }

  return {
    success: true,
    message: "Supply retrieved successfully.",
    data: supply,
  };
}

async function editSupplyService(supply_id, payload) {
  if (!isValidUUID(supply_id)) {
    return {
      success: false,
      code: "INVALID_SUPPLY_ID",
      message: "Invalid UUID format for supply_id.",
    };
  }

  const existingSupply = await findSupplyById(supply_id);
  if (!existingSupply) {
    return {
      success: false,
      code: "SUPPLY_NOT_FOUND",
      message: "Supply not found",
    };
  }

  const update = {};

  if (payload.supply_name !== undefined) {
    const normalizedSupplyName = cleanString(payload.supply_name);

    if (!normalizedSupplyName) {
      return {
        success: false,
        code: "INVALID_NAME",
        message: "Supply name cannot be empty.",
      };
    }

    if (normalizedSupplyName) {
      if (normalizedSupplyName.length > 50) {
        return {
          success: false,
          code: "INVALID_NAME",
          message: "Supply name is too long (max 50 characters).",
        };
      }
      if (normalizedSupplyName !== existingSupply.supply_name) {
        const existingSupplyName = await findSupplyByNameExcludingId(
          normalizedSupplyName,
          supply_id,
        );

        if (existingSupplyName) {
          return {
            success: false,
            code: "SUPPLY_ALREADY_EXISTS",
            message: "A supply with this name already exists.",
            data: null,
          };
        }
      }
      update.supply_name = normalizedSupplyName;
    }
  }

  if (payload.category !== undefined) {
    const normalizedCategory = payload.category
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const allowedCategories = [
      "food",
      "medicine",
      "cleaning",
      "equipment",
      "supplement",
    ];

    if (normalizedCategory && normalizedCategory.length > 50) {
      return {
        success: false,
        code: "INVALID_NAME",
        message: "Category is too long (max 50 characters).",
      };
    }

    if (!allowedCategories.includes(normalizedCategory)) {
      return {
        success: false,
        code: "INVALID_CATEGORY",
        message:
          "Category must be one of: food, medicine, cleaning, equipment, supplement.",
      };
    }
    update.category = normalizedCategory;
  }

  if (payload.type !== undefined) {
    const normalizedType = cleanString(payload.type);

    if (normalizedType.length > 50) {
      return {
        success: false,
        code: "INVALID_TYPE",
        message: "Type is too long (max 50 characters).",
      };
    }
    update.type = normalizedType;
  }

  if (payload.unit !== undefined) {
    const normalizedUnit = normalizeUnit(payload.unit);
    if (!normalizedUnit) {
      return {
        success: false,
        code: "INVALID_UNIT",
        message:
          "Unit is not recognized. Allowed units are: g, kg, ml, l, can, bag, bottle, box, sachet, piece.",
      };
    }
    update.unit = normalizedUnit;
  }

  if (payload.quantity_in_stock !== undefined) {
    const normalizedQuantity = normalizeStock(payload.quantity_in_stock);

    if (normalizedQuantity === null) {
      return {
        success: false,
        code: "INVALID_QUANTITY",
        message: "Stock level must be a non-negative number.",
      };
    }
    update.quantity_in_stock = normalizedQuantity;
  }

  if (payload.minimum_stock_level !== undefined) {
    const normalizedMinimumStock = normalizeStock(payload.minimum_stock_level);

    if (normalizedMinimumStock === null) {
      return {
        success: false,
        code: "INVALID_STOCK_LEVEL",
        message: "Stock level must be a non-negative number.",
      };
    }
    update.minimum_stock_level = normalizedMinimumStock;
  }

  if (payload.notes !== undefined) {
    update.notes = cleanString(payload.notes);
  }

  if (Object.keys(update).length === 0) {
    return {
      success: false,
      code: "NO_FIELDS_TO_UPDATE",
      message: "No valid fields provided for update.",
    };
  }

  const finalPayload = {
    supply_name: update.supply_name ?? existingSupply.supply_name,
    category: update.category ?? existingSupply.category,
    type: update.type ?? existingSupply.type,
    unit: update.unit ?? existingSupply.unit,
    quantity_in_stock:
      update.quantity_in_stock ?? existingSupply.quantity_in_stock,
    minimum_stock_level:
      update.minimum_stock_level ?? existingSupply.minimum_stock_level,
    notes: update.notes ?? existingSupply.notes,
  };

  const updatedSupply = await editSupply(supply_id, finalPayload);

  return {
    success: true,
    message: "Supply updated successfully.",
    data: updatedSupply,
  };
}

async function deleteSupplyService(supply_id) {
  if (!isValidUUID(supply_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid Supply ID.",
    };
  }

  const supply = await getSupplyById(supply_id);

  if (!supply) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Supply  not found.",
    };
  }

  if (supply.is_deleted) {
    return {
      success: false,
      code: "ALREADY_DELETED",
      message: "Supply already deleted.",
    };
  }

  const result = await deleteSupply(supply_id);

  return {
    success: true,
    message: "Supply successfully deleted.",
    data: result,
  };
}

async function restoreSupplyService(supply_id) {
  if (!isValidUUID(supply_id)) {
    return {
      success: false,
      code: "INVALID_ID",
      message: "Invalid Supply ID.",
    };
  }

  const supply = await getFindDeletedSupplyById(supply_id);

  if (!supply) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Supply not found.",
    };
  }

  if (!supply.is_deleted) {
    return {
      success: false,
      code: "ALREADY_ACTIVE",
      message: "Supply already active.",
    };
  }

  const result = await restoreSupply(supply_id);

  return {
    success: true,
    message: "Supply successfully restored.",
    data: result,
  };
}
module.exports = {
  createSupplyService,
  getAllSupplyService,
  getSupplyByIdService,
  editSupplyService,
  deleteSupplyService,
  restoreSupplyService,
};
