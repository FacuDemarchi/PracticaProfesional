const { pool } = require("../db/pool");

function mapDetalleConAlumno(row) {
  return {
    ...row,
    alumno: row.alumno_id
      ? {
          id: row.alumno_id,
          nombre: row.alumno_nombre,
          apellido: row.alumno_apellido,
          sala_id: row.alumno_sala_id,
          activo: row.alumno_activo,
        }
      : undefined,
  };
}

async function findDetalleAsistenciaById(id) {
  const result = await pool.query("select * from detalle_asistencia where id = $1", [id]);
  return result.rows[0];
}

async function findDetallesByTomaAsistenciaId(tomaAsistenciaId) {
  const result = await pool.query(
    `
      select
        da.*,
        a.nombre as alumno_nombre,
        a.apellido as alumno_apellido,
        a.sala_id as alumno_sala_id,
        a.activo as alumno_activo
      from detalle_asistencia da
      left join alumno a on a.id = da.alumno_id
      where da.toma_asistencia_id = $1
      order by a.apellido nulls last, a.nombre nulls last, da.id
    `,
    [tomaAsistenciaId]
  );
  return result.rows.map(mapDetalleConAlumno);
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
    const result = await pool.query(
      `
        select
          da.*,
          a.nombre as alumno_nombre,
          a.apellido as alumno_apellido,
          a.sala_id as alumno_sala_id,
          a.activo as alumno_activo
        from detalle_asistencia da
        left join alumno a on a.id = da.alumno_id
        where da.toma_asistencia_id = $1
        order by a.apellido nulls last, a.nombre nulls last, da.id
      `,
      [tomaAsistenciaId]
    );
    return result.rows.map(mapDetalleConAlumno);
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
