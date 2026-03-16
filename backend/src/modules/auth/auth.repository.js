const pool = require("../../config/db");

async function createUser(userData) {
  const result = await pool.query(
    "INSERT INTO users (first_name, middle_initial, last_name, password_hash, email, role_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      userData.first_name,
      userData.middle_initial ? userData.middle_initial : null,
      userData.last_name,
      userData.password_hash,
      userData.email,
      userData.role_id,
    ],
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT 
       u.id, 
       u.first_name, 
       u.middle_initial, 
       u.last_name, 
       u.password_hash,
       u.email, 
       r.role_id, 
       r.role_name AS role
     FROM users u
     INNER JOIN roles r ON u.role_id = r.role_id
     WHERE u.email = $1`,
    [email],
  );
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

async function findRoleByName(role_name) {
  const result = await pool.query("SELECT * FROM roles WHERE role_name = $1", [
    role_name,
  ]);
  return result.rows[0];
}

async function findUserProfile(id) {
  const result = await pool.query(
    `SELECT 
       u.id, 
       u.first_name, 
       u.middle_initial, 
       u.last_name, 
       u.email, 
       u.is_active, 
       r.role_name AS role
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findRoleByName,
  findUserProfile,
};
