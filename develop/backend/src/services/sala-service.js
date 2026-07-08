const { UserTypes } = require("../domain/user");
const {
  findAllSalas,
  findSalaById,
  findSalaByNombre,
  createSala,
  updateSala,
  deleteSala,
} = require("../repositories/sala-repository");
const {
  findProfesoresBySalaId,
  setProfesoresToSala,
  findSalasByProfesorId,
} = require("../repositories/sala-profesor-repository");
const { pool } = require("../db/pool");

function checkAdmin(user) {
  if (user.role !== UserTypes.ADMIN) {
    throw new Error("No autorizado: se requiere permiso de administrador");
  }
}

async function getAllSalas(user) {
  let salas;
  if (user.role === UserTypes.ADMIN) {
    salas = await findAllSalas();
  } else {
    salas = await findSalasByProfesorId(user.profesorId);
  }
  const salasConProfesores = [];
  for (const sala of salas) {
    const profesores = await findProfesoresBySalaId(sala.id);
    salasConProfesores.push({ ...sala, profesores });
  }
  return salasConProfesores;
}

async function getSalaById(user, id) {
  let sala = await findSalaById(id);
  if (!sala) return null;
  
  if (user.role === UserTypes.PROFESOR) {
    // Verify profesor has access to this sala
    const salasProfesor = await findSalasByProfesorId(user.profesorId);
    const hasAccess = salasProfesor.some(s => s.id === id);
    if (!hasAccess) {
      throw new Error("No autorizado: no tienes acceso a esta sala");
    }
  }
  
  const profesores = await findProfesoresBySalaId(id);
  return { ...sala, profesores };
}

function validarHorario(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) {
    return { valido: false, mensaje: "Hora de inicio y fin son requeridas" };
  }
  if (horaInicio >= horaFin) {
    return { valido: false, mensaje: "Hora de inicio debe ser menor a hora de fin" };
  }
  return { valido: true };
}

async function createSalaWithProfesores(user, nombre, horaInicio, horaFin, profesorIds, activa = true) {
  checkAdmin(user);
  const validacionHorario = validarHorario(horaInicio, horaFin);
  if (!validacionHorario.valido) {
    throw new Error(validacionHorario.mensaje);
  }

  if (!profesorIds || profesorIds.length === 0) {
    throw new Error("La sala debe tener al menos un profesor");
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const sala = await createSala(nombre, horaInicio, horaFin, activa);
    await setProfesoresToSala(sala.id, profesorIds);
    await client.query("commit");
    const profesores = await findProfesoresBySalaId(sala.id);
    return { ...sala, profesores };
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

async function updateSalaById(user, id, nombre, horaInicio, horaFin, profesorIds, activa) {
  checkAdmin(user);
  const validacionHorario = validarHorario(horaInicio, horaFin);
  if (!validacionHorario.valido) {
    throw new Error(validacionHorario.mensaje);
  }

  if (profesorIds !== undefined && profesorIds.length === 0) {
    throw new Error("La sala debe tener al menos un profesor");
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const sala = await updateSala(id, nombre, horaInicio, horaFin, activa);
    if (profesorIds !== undefined) {
      await setProfesoresToSala(sala.id, profesorIds);
    }
    await client.query("commit");
    const profesores = await findProfesoresBySalaId(sala.id);
    return { ...sala, profesores };
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

async function deleteSalaById(user, id) {
  checkAdmin(user);
  return await deleteSala(id);
}

module.exports = {
  getAllSalas,
  getSalaById,
  createSalaWithProfesores,
  updateSalaById,
  deleteSalaById,
};
