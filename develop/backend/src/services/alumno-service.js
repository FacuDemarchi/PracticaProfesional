const { UserTypes } = require("../domain/user");
const {
  findAllAlumnos,
  findAlumnosByProfesorId,
  findAlumnoById,
  createAlumno,
  updateAlumno,
} = require("../repositories/alumno-repository");
const { findSalaById } = require("../repositories/sala-repository");
const { isProfesorAssignedToSala } = require("../repositories/sala-profesor-repository");

async function getAlumnos(user, search = null) {
  if (user.type === UserTypes.ADMIN) {
    return await findAllAlumnos(search);
  } else if (user.type === UserTypes.PROFESOR) {
    return await findAlumnosByProfesorId(user.profesorId, search);
  }
  throw new Error("Tipo de usuario no autorizado");
}

async function getAlumnoById(user, id) {
  const alumno = await findAlumnoById(id);
  if (!alumno) {
    return null;
  }

  if (user.type === UserTypes.ADMIN) {
    return alumno;
  } else if (user.type === UserTypes.PROFESOR) {
    const isAssigned = await isProfesorAssignedToSala(user.profesorId, alumno.sala_id);
    if (isAssigned) {
      return alumno;
    }
  }
  throw new Error("No tienes permiso para acceder a este alumno");
}

async function createNewAlumno(user, nombre, apellido, salaId, activo = true) {
  const sala = await findSalaById(salaId);
  if (!sala) {
    throw new Error("La sala no existe");
  }

  if (user.type === UserTypes.PROFESOR) {
    const isAssigned = await isProfesorAssignedToSala(user.profesorId, salaId);
    if (!isAssigned) {
      throw new Error("No tienes permiso para crear alumnos en esta sala");
    }
  }

  return await createAlumno(nombre, apellido, salaId, activo);
}

async function updateExistingAlumno(user, id, nombre, apellido, salaId, activo) {
  const existingAlumno = await findAlumnoById(id);
  if (!existingAlumno) {
    return null;
  }

  if (user.type === UserTypes.PROFESOR) {
    const isAssignedToOldSala = await isProfesorAssignedToSala(user.profesorId, existingAlumno.sala_id);
    const isAssignedToNewSala = await isProfesorAssignedToSala(user.profesorId, salaId);
    if (!isAssignedToOldSala || !isAssignedToNewSala) {
      throw new Error("No tienes permiso para modificar este alumno");
    }
  }

  return await updateAlumno(id, nombre, apellido, salaId, activo);
}

module.exports = {
  getAlumnos,
  getAlumnoById,
  createNewAlumno,
  updateExistingAlumno,
};
