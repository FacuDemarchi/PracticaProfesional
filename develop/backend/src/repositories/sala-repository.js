const { pool } = require("../db/pool");

async function findSalaById(id) {
  const result = await pool.query("select * from sala where id = $1", [id]);
  return result.rows[0];
}

async function findAllSalas() {
  const result = await pool.query("select * from sala order by nombre");
  return result.rows;
}

async function findSalaByNombre(nombre) {
  const result = await pool.query("select * from sala where nombre = $1", [nombre]);
  return result.rows[0];
}

async function createSala(nombre, horaInicio, horaFin, activa = true) {
  const result = await pool.query(
    "insert into sala (nombre, hora_inicio, hora_fin, activa) values ($1, $2, $3, $4) returning *",
    [nombre, horaInicio, horaFin, activa]
  );
  return result.rows[0];
}

async function updateSala(id, nombre, horaInicio, horaFin, activa) {
  const result = await pool.query(
    "update sala set nombre = $1, hora_inicio = $2, hora_fin = $3, activa = $4 where id = $5 returning *",
    [nombre, horaInicio, horaFin, activa, id]
  );
  return result.rows[0];
}

async function deleteSala(id) {
  const result = await pool.query("delete from sala where id = $1 returning *", [id]);
  return result.rows[0];
}

module.exports = {
  findSalaById,
  findAllSalas,
  findSalaByNombre,
  createSala,
  updateSala,
  deleteSala,
};
