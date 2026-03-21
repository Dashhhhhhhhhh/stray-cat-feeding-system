// updateSupply

// softDeleteSupply

// findDeletedSupplyById

// restoreSupply

const pool = require("../../config/db");

async function createSupply(supplyData) {
  const result = await pool.query(
    `INSERT INTO supplies
        (
            supply_name,
            category,
            unit,
            quantity_in_stock,
            minimum_stock_level,
            notes,
            type
        )
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
    [
      supplyData.supply_name,
      supplyData.category,
      supplyData.unit,
      supplyData.quantity_in_stock,
      supplyData.minimum_stock_level,
      supplyData.notes,
      supplyData.type,
    ],
  );
  return result.rows[0];
}

async function findSupplyByName(supply_name) {
  const result = await pool.query(
    `SELECT
            s.supply_id,
            s.supply_name
        FROM supplies s
        WHERE s.supply_name = $1`,
    [supply_name],
  );
  return result.rows[0];
}

async function getAllSupplies() {
  const result = await pool.query(
    `SELECT 
        s.supply_id,
        s.supply_name,
        s.category,
        s.unit,
        s.quantity_in_stock,
        s.minimum_stock_level,
        s.notes,
        s.type
     FROM supplies s
     WHERE s.is_deleted = false
     ORDER BY s.supply_name ASC`,
  );
  return result.rows;
}

async function getSupplyById(supply_id) {
  const result = await pool.query(
    `
    SELECT
        supply_id,
        supply_name,
        category,
        unit,
        quantity_in_stock,
        minimum_stock_level,
        notes,
        type
    FROM supplies
    WHERE
      is_deleted = false
      AND supply_id = $1`,
    [supply_id],
  );
  return result.rows[0];
}

// prettier-ignore
async function findSupplyByNameExcludingId(supply_name, supply_id) {
  const result = await pool.query(
    `
    SELECT
      supply_id,
      supply_name
    FROM supplies
    WHERE
      is_deleted = false
      AND supply_name = $1
      AND supply_id <> $2`,
      [supply_name, supply_id]
  );
  return result.rows[0];
}

async function findSupplyById(supply_id) {
  const result = await pool.query(
    `
      SELECT 
        supply_id,
        supply_name,
        category,
        type,
        unit,
        quantity_in_stock,
        minimum_stock_level,
        notes
      FROM
        supplies
      WHERE 
        is_deleted = false
        AND supply_id = $1
    `,
    [supply_id],
  );
  return result.rows[0];
}

async function editSupply(supply_id, payload) {
  const result = await pool.query(
    `
      UPDATE supplies
        SET
          supply_name = $1,
          category = $2,
          type = $3,
          unit = $4,
          quantity_in_stock = $5,
          minimum_stock_level = $6,
          notes = $7,
          updated_at = NOW()
        WHERE 
          supply_id = $8
        RETURNING
          supply_id,
          supply_name,
          category,
          type,
          unit,
          quantity_in_stock,
          minimum_stock_level,
          notes,
          updated_at
    `,
    [
      payload.supply_name,
      payload.category,
      payload.type,
      payload.unit,
      payload.quantity_in_stock,
      payload.minimum_stock_level,
      payload.notes,
      supply_id,
    ],
  );
  return result.rows[0];
}

async function deleteSupply(supply_id) {
  const result = await pool.query(
    `
    UPDATE supplies
    SET
      is_deleted = true,
      updated_at = CURRENT_TIMESTAMP
      WHERE supply_id = $1 AND is_deleted = false
      RETURNING supply_id, is_deleted, updated_at
    `,
    [supply_id],
  );
  return result.rows[0];
}

async function restoreSupply(supply_id) {
  const result = await pool.query(
    `
    UPDATE supplies
    SET
      is_deleted = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE supply_id = $1 AND is_deleted = true
    RETURNING supply_id, is_deleted, updated_at
    `,
    [supply_id],
  );
  return result.rows[0];
}

async function getFindDeletedSupplyById(supply_id) {
  const result = await pool.query(
    `
    SELECT
      supply_id,
      is_deleted,
      updated_at
    FROM
      supplies
    WHERE
      is_deleted = true
      AND supply_id = $1
      `,
    [supply_id],
  );
  return result.rows[0];
}
module.exports = {
  createSupply,
  findSupplyByName,
  getAllSupplies,
  getSupplyById,
  findSupplyByNameExcludingId,
  findSupplyById,
  editSupply,
  deleteSupply,
  restoreSupply,
  getFindDeletedSupplyById,
};
