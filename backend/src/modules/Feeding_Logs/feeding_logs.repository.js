const pool = require("../../config/db");

async function createFeedingLogs(feedingData) {
  const result = await pool.query(
    `INSERT INTO feeding_logs
            (
            area_id,
            fed_by_user_id,
            feeding_time, 
            feeding_type_id,
            quantity,
            quantity_unit,
            notes
            )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `,
    [
      feedingData.area_id,
      feedingData.fed_by_user_id,
      feedingData.feeding_time,
      feedingData.feeding_type_id,
      feedingData.quantity,
      feedingData.quantity_unit,
      feedingData.notes,
    ],
  );
  return result.rows[0];
}

async function findFeedingTypeById(feeding_type_id) {
  const result = await pool.query(
    `SELECT 
      f.feeding_type_id,
      f.feeding_type_name
   FROM feeding_types f
   WHERE f.feeding_type_id = $1`,
    [feeding_type_id],
  );
  return result.rows[0];
}

async function getAllFeedingLogs({
  page = 1,
  pageSize = 10,
  sortBy = "feeding_time",
  sortOrder = "DESC",
  is_deleted = false,
}) {
  const offset = (page - 1) * pageSize;
  const order = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const allowedSortColumns = ["feeding_time", "created_at"];
  const safeSortBy = allowedSortColumns.includes(sortBy)
    ? sortBy
    : "feeding_time";

  let query = `
    SELECT
      feeding_log_id,
      area_id,
      fed_by_user_id,
      feeding_time,
      quantity,
      quantity_unit,
      notes,
      created_at,
      updated_at,
      feeding_type_id,
      is_deleted
    FROM feeding_logs
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (typeof is_deleted === "boolean") {
    query += ` AND is_deleted = $${paramIndex++}`;
    params.push(is_deleted);
  }

  query += `
    ORDER BY ${safeSortBy} ${order}
    LIMIT $${paramIndex++}
    OFFSET $${paramIndex++}
  `;

  params.push(pageSize, offset);

  const result = await pool.query(query, params);
  return result.rows;
}
// prettier-ignore
async function getFeedingLogById(feeding_log_id) {
  const result = await pool.query(
    `SELECT 
      feeding_log_id,
      area_id,
      fed_by_user_id,
      feeding_time,
      quantity,
      quantity_unit,
      notes,
      created_at,
      updated_at,
      feeding_type_id
    FROM feeding_logs 
    WHERE 
      is_deleted = false
      AND feeding_log_id = $1`,
    [feeding_log_id],
  );
  return result.rows[0];
}

async function editFeedingLogs(feeding_log_id, payload) {
  const result = await pool.query(
    `
      UPDATE feeding_logs
      SET
        area_id = $1,
        feeding_time = $2,
        feeding_type_id = $3,
        quantity = $4,
        quantity_unit = $5,
        notes = $6
      WHERE
        feeding_log_id = $7
      RETURNING
        feeding_log_id,
        area_id,
        fed_by_user_id,
        feeding_time,
        quantity,
        quantity_unit,
        notes,
        created_at,
        updated_at,
        feeding_type_id
    `,
    [
      payload.area_id,
      payload.feeding_time,
      payload.feeding_type_id,
      payload.quantity,
      payload.quantity_unit,
      payload.notes,
      feeding_log_id,
    ],
  );
  return result.rows[0];
}

// prettier-ignore
async function deleteLogs(feeding_log_id) {
  const result = await pool.query(
    `
      UPDATE feeding_logs
      SET
        is_deleted = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE feeding_log_id = $1 AND is_deleted = false
      RETURNING feeding_log_id, is_deleted, updated_at  
      `,
    [feeding_log_id]
  );
  return result.rows[0];
}

async function restoreLogs(feeding_log_id) {
  const result = await pool.query(
    `
      UPDATE feeding_logs
      SET
        is_deleted = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE feeding_log_id = $1 AND is_deleted = true  
    RETURNING feeding_log_id, is_deleted, updated_at  
      `,
    [feeding_log_id],
  );
  return result.rows[0];
}

async function getFindDeledLogsById(feeding_log_id) {
  const result = await pool.query(
    `
      SELECT 
        feeding_log_id,
        is_deleted,
        updated_at
      FROM
        feeding_logs
      WHERE 
        is_deleted = true
        AND feeding_log_id = $1
      `,
    [feeding_log_id],
  );
  return result.rows[0];
}
module.exports = {
  createFeedingLogs,
  findFeedingTypeById,
  getAllFeedingLogs,
  getFeedingLogById,
  editFeedingLogs,
  deleteLogs,
  restoreLogs,
  getFindDeledLogsById,
};
