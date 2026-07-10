const { pool } = require("../db/pool");

async function findTomaAsistenciaById(id) {
  const result = await pool.query("select * from toma_asistencia where id = $1", [id]);
  return result.rows[0];
}

async function findTomaAsistenciaBySalaAndFecha(salaId, fecha) {
  const result = await pool.query("select * from toma_asistencia where sala_id = $1 and fecha = $2", [salaId, fecha]);
  return result.rows[0];
}

async function findTomaAsistenciasBySalaId(salaId) {
  const result = await pool.query(`
    select 
      ta.*,
      s.nombre as sala_nombre,
      p.nombre as profesor_nombre,
      p.apellido as profesor_apellido
    from toma_asistencia ta
    join sala s on ta.sala_id = s.id
    join profesor p on ta.creador_profesor_id = p.id
    where ta.sala_id = $1 
    order by ta.fecha desc, ta.hora_creacion desc
  `, [salaId]);
  return result.rows.map(row => ({
    ...row,
    sala: { id: row.sala_id, nombre: row.sala_nombre },
    profesor: { id: row.creador_profesor_id, nombre: row.profesor_nombre, apellido: row.profesor_apellido }
  }));
}

async function findTomaAsistenciasByProfesorId(profesorId) {
  const result = await pool.query(`
    select 
      ta.*,
      s.nombre as sala_nombre,
      p.nombre as profesor_nombre,
      p.apellido as profesor_apellido
    from toma_asistencia ta
    join sala s on ta.sala_id = s.id
    join profesor p on ta.creador_profesor_id = p.id
    where ta.creador_profesor_id = $1 
    order by ta.fecha desc, ta.hora_creacion desc
  `, [profesorId]);
  return result.rows.map(row => ({
    ...row,
    sala: { id: row.sala_id, nombre: row.sala_nombre },
    profesor: { id: row.creador_profesor_id, nombre: row.profesor_nombre, apellido: row.profesor_apellido }
  }));
}

async function findAllTomaAsistencias() {
  const result = await pool.query(`
    select 
      ta.*,
      s.nombre as sala_nombre,
      p.nombre as profesor_nombre,
      p.apellido as profesor_apellido
    from toma_asistencia ta
    join sala s on ta.sala_id = s.id
    join profesor p on ta.creador_profesor_id = p.id
    order by ta.fecha desc, ta.hora_creacion desc
  `);
  return result.rows.map(row => ({
    ...row,
    sala: { id: row.sala_id, nombre: row.sala_nombre },
    profesor: { id: row.creador_profesor_id, nombre: row.profesor_nombre, apellido: row.profesor_apellido }
  }));
}

async function createTomaAsistencia(salaId, creadorProfesorId, fecha, horaCreacion, estado = "abierta") {
  const result = await pool.query(
    "insert into toma_asistencia (sala_id, creador_profesor_id, fecha, hora_creacion, estado) values ($1, $2, $3, $4, $5) returning *",
    [salaId, creadorProfesorId, fecha, horaCreacion, estado]
  );
  return result.rows[0];
}

async function updateTomaAsistencia(id, estado) {
  const result = await pool.query(
    "update toma_asistencia set estado = $1, actualizada_en = current_timestamp where id = $2 returning *",
    [estado, id]
  );
  return result.rows[0];
}

async function deleteTomaAsistencia(id) {
  const result = await pool.query("delete from toma_asistencia where id = $1 returning *", [id]);
  return result.rows[0];
}

module.exports = {
  findTomaAsistenciaById,
  findTomaAsistenciaBySalaAndFecha,
  findTomaAsistenciasBySalaId,
  findTomaAsistenciasByProfesorId,
  findAllTomaAsistencias,
  createTomaAsistencia,
  updateTomaAsistencia,
  deleteTomaAsistencia,
};
