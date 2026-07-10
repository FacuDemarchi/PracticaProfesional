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

async function isProfesorAssignedToSala(profesorId, salaId) {
  const result = await pool.query(
    "select 1 from sala_profesor where profesor_id = $1 and sala_id = $2 limit 1",
    [profesorId, salaId]
  );
  return result.rowCount > 0;
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

async function setProfesoresToSala(salaId, profesorIds, dbClient = null) {
  const client = dbClient || await pool.connect();
  const shouldManageTransaction = !dbClient;
  try {
    if (shouldManageTransaction) {
      await client.query("begin");
    }

    const existentesResult = await client.query(
      "select profesor_id from sala_profesor where sala_id = $1",
      [salaId]
    );
    const profesorIdsActuales = new Set(
      existentesResult.rows.map((row) => row.profesor_id)
    );
    const profesorIdsDeseados = Array.from(new Set(profesorIds));

    const profesorIdsAEliminar = Array.from(profesorIdsActuales).filter(
      (profesorId) => !profesorIdsDeseados.includes(profesorId)
    );
    const profesorIdsAAgregar = profesorIdsDeseados.filter(
      (profesorId) => !profesorIdsActuales.has(profesorId)
    );

    for (const profesorId of profesorIdsAEliminar) {
      await client.query(
        "delete from sala_profesor where sala_id = $1 and profesor_id = $2",
        [salaId, profesorId]
      );
    }

    const resultados = [];
    for (const profesorId of profesorIdsAAgregar) {
      const result = await client.query(
        "insert into sala_profesor (sala_id, profesor_id) values ($1, $2) returning *",
        [salaId, profesorId]
      );
      resultados.push(result.rows[0]);
    }

    if (shouldManageTransaction) {
      await client.query("commit");
    }

    return resultados;
  } catch (err) {
    if (shouldManageTransaction) {
      await client.query("rollback");
    }
    if (err.code === "23503" && err.constraint === "fk_toma_creador_asignado") {
      const friendlyError = new Error(
        "No se puede desasignar un profesor de la sala porque ya registró asistencias en esta sala"
      );
      friendlyError.code = err.code;
      friendlyError.constraint = err.constraint;
      throw friendlyError;
    }
    throw err;
  } finally {
    if (shouldManageTransaction) {
      client.release();
    }
  }
}

module.exports = {
  findProfesoresBySalaId,
  findSalasByProfesorId,
  isProfesorAssignedToSala,
  addProfesorToSala,
  removeProfesorFromSala,
  setProfesoresToSala,
};
