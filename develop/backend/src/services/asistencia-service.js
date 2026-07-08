const { UserTypes } = require("../domain/user");
const {
  findTomaAsistenciaById,
  findTomaAsistenciaBySalaAndFecha,
  findTomaAsistenciasBySalaId,
  findTomaAsistenciasByProfesorId,
  findAllTomaAsistencias,
  createTomaAsistencia,
  updateTomaAsistencia,
  deleteTomaAsistencia,
} = require("../repositories/toma-asistencia-repository");
const {
  findDetalleAsistenciaById,
  findDetallesByTomaAsistenciaId,
  createDetalleAsistencia,
  updateDetalleAsistencia,
  upsertDetallesForToma,
} = require("../repositories/detalle-asistencia-repository");
const { findAlumnosBySalaId } = require("../repositories/alumno-repository");
const { findSalasByProfesorId, findProfesoresBySalaId } = require("../repositories/sala-profesor-repository");
const { pool } = require("../db/pool");

function checkProfesorOrAdmin(user) {
  if (user.role !== UserTypes.PROFESOR && user.role !== UserTypes.ADMIN) {
    throw new Error("No autorizado");
  }
}

function checkAdmin(user) {
  if (user.role !== UserTypes.ADMIN) {
    throw new Error("No autorizado: solo el administrador puede acceder a este recurso");
  }
}

async function getAllTomaAsistencias(user) {
  checkAdmin(user);
  
  const tomas = await findAllTomaAsistencias();
  const tomasConDetalles = [];
  for (const toma of tomas) {
    const detalles = await findDetallesByTomaAsistenciaId(toma.id);
    tomasConDetalles.push({ ...toma, detalles });
  }
  return tomasConDetalles;
}

async function getTomaAsistenciaById(user, id) {
  checkProfesorOrAdmin(user);
  const toma = await findTomaAsistenciaById(id);
  if (!toma) return null;
  
  if (user.role === UserTypes.PROFESOR) {
    const salasProfesor = await findSalasByProfesorId(user.profesorId);
    const hasAccess = salasProfesor.some(s => s.id === toma.sala_id);
    if (!hasAccess) {
      throw new Error("No autorizado: no tienes acceso a esta toma de asistencia");
    }
  }
  
  const detalles = await findDetallesByTomaAsistenciaId(id);
  return { ...toma, detalles };
}

async function getTomaAsistenciasBySalaId(user, salaId) {
  checkProfesorOrAdmin(user);
  
  if (user.role === UserTypes.PROFESOR) {
    const salasProfesor = await findSalasByProfesorId(user.profesorId);
    const hasAccess = salasProfesor.some(s => s.id === salaId);
    if (!hasAccess) {
      throw new Error("No autorizado: no tienes acceso a esta sala");
    }
  }
  
  const tomas = await findTomaAsistenciasBySalaId(salaId);
  const tomasConDetalles = [];
  for (const toma of tomas) {
    const detalles = await findDetallesByTomaAsistenciaId(toma.id);
    tomasConDetalles.push({ ...toma, detalles });
  }
  return tomasConDetalles;
}

async function createOrUpdateTomaAsistencia(user, salaId, fecha, detalles) {
  checkProfesorOrAdmin(user);
  
  if (user.role === UserTypes.PROFESOR) {
    const salasProfesor = await findSalasByProfesorId(user.profesorId);
    const hasAccess = salasProfesor.some(s => s.id === salaId);
    if (!hasAccess) {
      throw new Error("No autorizado: no tienes acceso a esta sala");
    }
  }
  
  const alumnos = await findAlumnosBySalaId(salaId);
  const alumnoIds = alumnos.map(a => a.id);
  
  // Validate all detalles correspond to alumnos in the sala
  for (const detalle of detalles) {
    if (!alumnoIds.includes(detalle.alumnoId)) {
      throw new Error(`Alumno con id ${detalle.alumnoId} no pertenece a la sala`);
    }
  }
  
  const client = await pool.connect();
  try {
    await client.query("begin");
    
    let toma = await findTomaAsistenciaBySalaAndFecha(salaId, fecha);
    const now = new Date();
    const horaCreacion = now.toTimeString().split(' ')[0]; // HH:MM:SS
    
    if (!toma) {
      // Create new toma
      let creadorProfesorId;
      if (user.role === UserTypes.PROFESOR) {
        creadorProfesorId = user.profesorId;
      } else {
        // For admin, pick first profesor of the sala
        const profesoresSala = await findProfesoresBySalaId(salaId);
        if (profesoresSala.length === 0) {
          throw new Error("La sala no tiene profesores asignados");
        }
        creadorProfesorId = profesoresSala[0].id;
      }
      
      toma = await createTomaAsistencia(
        salaId,
        creadorProfesorId,
        fecha,
        horaCreacion,
        "abierta"
      );
    } else {
      // Check if profesor can modify (only same day)
      if (user.role === UserTypes.PROFESOR) {
        const today = new Date().toISOString().split('T')[0];
        if (fecha !== today) {
          throw new Error("No autorizado: solo puedes modificar tomas del día de hoy");
        }
      }
    }
    
    // Upsert detalles
    const detallesCreados = await upsertDetallesForToma(toma.id, detalles);
    
    // Update toma estado to cerrada
    await updateTomaAsistencia(toma.id, "cerrada");
    
    await client.query("commit");
    
    return { ...toma, detalles: detallesCreados };
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

async function deleteTomaAsistenciaById(user, id) {
  if (user.role !== UserTypes.ADMIN) {
    throw new Error("No autorizado: solo el administrador puede eliminar tomas de asistencia");
  }
  
  return await deleteTomaAsistencia(id);
}

module.exports = {
  getAllTomaAsistencias,
  getTomaAsistenciaById,
  getTomaAsistenciasBySalaId,
  createOrUpdateTomaAsistencia,
  deleteTomaAsistenciaById,
};
