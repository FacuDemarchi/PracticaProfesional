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
const { findSalaById } = require("../repositories/sala-repository");
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

function getCurrentArgentinaDateTimeParts() {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const getPart = (type) => parts.find((part) => part.type === type)?.value || "00";

  return {
    date: `${getPart("year")}-${getPart("month")}-${getPart("day")}`,
    time: `${getPart("hour")}:${getPart("minute")}:${getPart("second")}`,
  };
}

function normalizeClientTime(time) {
  if (!time || typeof time !== "string") {
    return null;
  }

  const parts = time.split(":");
  if (parts.length < 2) {
    return null;
  }

  const [hours = "00", minutes = "00", seconds = "00"] = parts;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}

function getRequestDateTimeParts(fechaActual, horaActual) {
  const normalizedTime = normalizeClientTime(horaActual);

  if (fechaActual && normalizedTime) {
    return {
      date: fechaActual,
      time: normalizedTime,
    };
  }

  return getCurrentArgentinaDateTimeParts();
}

async function validateProfesorHorario(salaId, fecha, userRole, fechaActual, horaActual) {
  if (userRole !== UserTypes.PROFESOR) {
    return;
  }

  const sala = await findSalaById(salaId);
  if (!sala) {
    throw new Error("La sala no existe");
  }

  const now = getRequestDateTimeParts(fechaActual, horaActual);
  if (fecha !== now.date) {
    throw new Error("Solo puedes tomar asistencia en la fecha actual");
  }

  if (now.time < sala.hora_inicio || now.time > sala.hora_fin) {
    throw new Error("La asistencia solo puede tomarse durante el horario de la clase");
  }
}

async function getAllTomaAsistencias(user) {
  checkProfesorOrAdmin(user);

  const tomas =
    user.role === UserTypes.PROFESOR
      ? await findTomaAsistenciasByProfesorId(user.profesorId)
      : await findAllTomaAsistencias();
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

async function createOrUpdateTomaAsistencia(user, salaId, fecha, detalles, fechaActual, horaActual) {
  checkProfesorOrAdmin(user);
  
  if (user.role === UserTypes.PROFESOR) {
    const salasProfesor = await findSalasByProfesorId(user.profesorId);
    const hasAccess = salasProfesor.some(s => s.id === salaId);
    if (!hasAccess) {
      throw new Error("No autorizado: no tienes acceso a esta sala");
    }
  }

  const requestDateTime = getRequestDateTimeParts(fechaActual, horaActual);

  await validateProfesorHorario(salaId, fecha, user.role, requestDateTime.date, requestDateTime.time);
  
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
    const horaCreacion = requestDateTime.time;
    
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
        const today = requestDateTime.date;
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
