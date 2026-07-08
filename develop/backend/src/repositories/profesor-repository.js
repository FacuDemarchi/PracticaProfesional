const { pool } = require("../db/pool");

async function findProfesorByNombreApellido(nombre, apellido) {
  const result = await pool.query(
    "select * from profesor where nombre = $1 and apellido = $2",
    [nombre, apellido]
  );
  return result.rows[0];
}

async function findProfesorById(id) {
  const result = await pool.query("select * from profesor where id = $1", [id]);
  return result.rows[0];
}

async function findAllProfesores() {
  const result = await pool.query("select * from profesor order by apellido, nombre");
  return result.rows;
}

async function createProfesor(nombre, apellido, habilitado = true) {
  const result = await pool.query(
    "insert into profesor (nombre, apellido, habilitado) values ($1, $2, $3) returning *",
    [nombre, apellido, habilitado]
  );
  return result.rows[0];
}

async function updateProfesor(id, nombre, apellido, habilitado) {
  const result = await pool.query(
    "update profesor set nombre = $1, apellido = $2, habilitado = $3, actualizado_en = current_timestamp where id = $4 returning *",
    [nombre, apellido, habilitado, id]
  );
  return result.rows[0];
}

async function deleteProfesor(id) {
  const result = await pool.query("delete from profesor where id = $1 returning *", [id]);
  return result.rows[0];
}

module.exports = {
  findProfesorByNombreApellido,
  findProfesorById,
  findAllProfesores,
  createProfesor,
  updateProfesor,
  deleteProfesor,
};
