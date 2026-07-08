const { pool } = require("../db/pool");

async function findProfesoresBySalaId(salaId) {
  const result = await pool.query(
    "select p.* from profesor p join sala_profesor sp on p.id = sp.profesor_id where sp.sala_id = $1",
    [salaId]
  );
  return result.rows;
}

async function findSalasByProfesorId(profesorId) {
  const result = await pool.query(
    "select s.* from sala s join sala_profesor sp on s.id = sp.sala_id where sp.profesor_id = $1",
    [profesorId]
  );
  return result.rows;
}

async function addProfesorToSala(salaId, profesorId) {
  const result = await pool.query(
    "insert into sala_profesor (sala_id, profesor_id) values ($1, $2) returning *",
    [salaId, profesorId]
  );
  return result.rows[0];
}

async function removeProfesorFromSala(salaId, profesorId) {
  const result = await pool.query(
    "delete from sala_profesor where sala_id = $1 and profesor_id = $2 returning *",
    [salaId, profesorId]
  );
  return result.rows[0];
}

async function setProfesoresToSala(salaId, profesorIds) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("delete from sala_profesor where sala_id = $1", [salaId]);
    const resultados = [];
    for (const profesorId of profesorIds) {
      const result = await client.query(
        "insert into sala_profesor (sala_id, profesor_id) values ($1, $2) returning *",
        [salaId, profesorId]
      );
      resultados.push(result.rows[0]);
    }
    await client.query("commit");
    return resultados;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  findProfesoresBySalaId,
  findSalasByProfesorId,
  addProfesorToSala,
  removeProfesorFromSala,
  setProfesoresToSala,
};
