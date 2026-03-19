const pool = require("../../config/db");

async function createArea(areaData) {
  const result = await pool.query(
    `INSERT INTO areas
            (area_name, location_description) 
        VALUES 
            ($1, $2) 
        RETURNING *
    `,
    [
      areaData.area_name,
      areaData.location_description ? areaData.location_description : null,
    ],
  );
  return result.rows[0];
}

async function findAreaByName(area_name) {
  // prettier-ignore
  const result = await pool.query(
    `SELECT
        a.area_id,
        a.area_name,
        a.location_description,
        a.is_active
     FROM areas a
     WHERE a.area_name = $1`,
    [area_name]
  );
  return result.rows[0];
}

async function getAllAreas() {
  const result = await pool.query(`SELECT * FROM areas ORDER BY area_name ASC`);
  return result.rows;
}

async function getAreasById(area_id) {
  const result = await pool.query(`SELECT * FROM areas WHERE area_id = $1`, [
    area_id,
  ]);
  return result.rows[0];
}

// prettier-ignore
async function editAreas(area_id, payload) {
  const result = await pool.query(
    `
        UPDATE areas 
        SET 
            area_name = $1,
            location_description = $2
        WHERE 
            area_id = $3
        RETURNING *;
        `,
    [payload.area_name, payload.location_description, area_id]
  );

  return result.rows[0];
}

// prettier-ignore
async function softDeleteAreas(area_id) {
  const result = await pool.query(
    `
            UPDATE areas
            SET
                is_active = false,
                updated_at = CURRENT_TIMESTAMP
                WHERE area_id = $1 AND is_active = true
                RETURNING *
        `,
    [area_id]
  );
  return result.rows[0];
}

async function restoreAreas(area_id) {
  const result = await pool.query(
    `
            UPDATE areas
            SET
                is_active = true,
                updated_at = CURRENT_TIMESTAMP
                WHERE area_id = $1 AND is_active = false,
                RETURNING *
        `,
    [area_id],
  );
  return result.rows[0];
}
module.exports = {
  createArea,
  findAreaByName,
  getAllAreas,
  getAreasById,
  editAreas,
  softDeleteAreas,
  restoreAreas,
};
