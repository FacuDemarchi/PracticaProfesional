const { pool } = require("../db/pool");

async function findAllAlumnos(search = null) {
  let query = "select * from alumno";
  let params = [];

  if (search) {
    query += " where nombre ilike $1 or apellido ilike $1";
    params.push(`%${search}%`);
  }

  query += " order by apellido, nombre";
  const result = await pool.query(query, params);
  return result.rows;
}

async function findAlumnosByProfesorId(profesorId, search = null) {
  let query = `
    select distinct a.*
    from alumno a
    join sala s on a.sala_id = s.id
    join sala_profesor sp on s.id = sp.sala_id
    where sp.profesor_id = $1
  `;
  let params = [profesorId];

  if (search) {
    query += " and (a.nombre ilike $2 or a.apellido ilike $2)";
    params.push(`%${search}%`);
  }

  query += " order by a.apellido, a.nombre";
  const result = await pool.query(query, params);
  return result.rows;
}

async function findAlumnosBySalaId(salaId) {
  const result = await pool.query("select * from alumno where sala_id = $1 and activo = true order by apellido, nombre", [salaId]);
  return result.rows;
}

async function findAlumnoById(id) {
  const result = await pool.query("select * from alumno where id = $1", [id]);
  return result.rows[0];
}

async function createAlumno(nombre, apellido, salaId, activo = true) {
  const result = await pool.query(
    "insert into alumno (nombre, apellido, sala_id, activo) values ($1, $2, $3, $4) returning *",
    [nombre, apellido, salaId, activo]
  );
  return result.rows[0];
}

async function updateAlumno(id, nombre, apellido, salaId, activo) {
  const result = await pool.query(
    "update alumno set nombre = $1, apellido = $2, sala_id = $3, activo = $4 where id = $5 returning *",
    [nombre, apellido, salaId, activo, id]
  );
  return result.rows[0];
}

async function deleteAlumno(id) {
  const result = await pool.query("delete from alumno where id = $1 returning *", [id]);
  return result.rows[0];
}

module.exports = {
  findAllAlumnos,
  findAlumnosByProfesorId,
  findAlumnosBySalaId,
  findAlumnoById,
  createAlumno,
  updateAlumno,
  deleteAlumno,
};
