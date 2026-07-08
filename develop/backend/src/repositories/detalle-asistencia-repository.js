const { pool } = require("../db/pool");

async function findDetalleAsistenciaById(id) {
  const result = await pool.query("select * from detalle_asistencia where id = $1", [id]);
  return result.rows[0];
}

async function findDetallesByTomaAsistenciaId(tomaAsistenciaId) {
  const result = await pool.query("select * from detalle_asistencia where toma_asistencia_id = $1", [tomaAsistenciaId]);
  return result.rows;
}

async function createDetalleAsistencia(tomaAsistenciaId, alumnoId, presente, observacion = null) {
  const result = await pool.query(
    "insert into detalle_asistencia (toma_asistencia_id, alumno_id, presente, observacion) values ($1, $2, $3, $4) returning *",
    [tomaAsistenciaId, alumnoId, presente, observacion]
  );
  return result.rows[0];
}

async function updateDetalleAsistencia(id, presente, observacion) {
  const result = await pool.query(
    "update detalle_asistencia set presente = $1, observacion = $2 where id = $3 returning *",
    [presente, observacion, id]
  );
  return result.rows[0];
}

async function upsertDetallesForToma(tomaAsistenciaId, detalles) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    
    // Delete existing detalles first
    await client.query("delete from detalle_asistencia where toma_asistencia_id = $1", [tomaAsistenciaId]);
    
    // Insert new detalles
    for (const detalle of detalles) {
      await client.query(
        "insert into detalle_asistencia (toma_asistencia_id, alumno_id, presente, observacion) values ($1, $2, $3, $4)",
        [tomaAsistenciaId, detalle.alumnoId, detalle.presente, detalle.observacion || null]
      );
    }
    
    await client.query("commit");
    
    // Return the new detalles
    const result = await pool.query("select * from detalle_asistencia where toma_asistencia_id = $1", [tomaAsistenciaId]);
    return result.rows;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  findDetalleAsistenciaById,
  findDetallesByTomaAsistenciaId,
  createDetalleAsistencia,
  updateDetalleAsistencia,
  upsertDetallesForToma,
};
