const { pool } = require("../db/pool");

async function findCredencialByProfesorId(profesorId) {
  const result = await pool.query(
    "select * from credencial_profesor where profesor_id = $1",
    [profesorId]
  );
  return result.rows[0];
}

async function findAllCredenciales() {
  const result = await pool.query("select * from credencial_profesor");
  return result.rows;
}

module.exports = {
  findCredencialByProfesorId,
  findAllCredenciales,
};
