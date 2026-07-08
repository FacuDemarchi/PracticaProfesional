const {
  getAlumnos,
  getAlumnoById,
  createNewAlumno,
  updateExistingAlumno,
} = require("../services/alumno-service");

async function handleGetAlumnos(req, res) {
  try {
    const search = req.query.search || null;
    const alumnos = await getAlumnos(req.user, search);
    return res.status(200).json({ ok: true, data: alumnos });
  } catch (err) {
    console.error(err);
    if (err.message.includes("permiso") || err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleGetAlumnoById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID de alumno inválido" });
    }

    const alumno = await getAlumnoById(req.user, id);
    if (!alumno) {
      return res.status(404).json({ ok: false, message: "Alumno no encontrado" });
    }

    return res.status(200).json({ ok: true, data: alumno });
  } catch (err) {
    console.error(err);
    if (err.message.includes("permiso") || err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleCreateAlumno(req, res) {
  try {
    const { nombre, apellido, sala_id, activo } = req.body;

    if (!nombre || !apellido || !sala_id) {
      return res.status(400).json({ ok: false, message: "Nombre, apellido y sala_id son requeridos" });
    }

    const alumno = await createNewAlumno(req.user, nombre, apellido, sala_id, activo ?? true);
    return res.status(201).json({ ok: true, data: alumno });
  } catch (err) {
    console.error(err);
    if (err.message.includes("permiso") || err.message.includes("autorizado") || err.message.includes("sala no existe")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleUpdateAlumno(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID de alumno inválido" });
    }

    const { nombre, apellido, sala_id, activo } = req.body;
    if (!nombre || !apellido || !sala_id || activo === undefined) {
      return res.status(400).json({ ok: false, message: "Todos los campos son requeridos" });
    }

    const alumno = await updateExistingAlumno(req.user, id, nombre, apellido, sala_id, activo);
    if (!alumno) {
      return res.status(404).json({ ok: false, message: "Alumno no encontrado" });
    }

    return res.status(200).json({ ok: true, data: alumno });
  } catch (err) {
    console.error(err);
    if (err.message.includes("permiso") || err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

module.exports = {
  handleGetAlumnos,
  handleGetAlumnoById,
  handleCreateAlumno,
  handleUpdateAlumno,
};
