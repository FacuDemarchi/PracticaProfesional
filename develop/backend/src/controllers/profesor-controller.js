const {
  getAllProfesores,
  getProfesorById,
  createProfesorWithPassword,
  updateProfesorById,
  deleteProfesorById,
} = require("../services/profesor-service");

async function handleGetAllProfesores(req, res) {
  try {
    const profesores = await getAllProfesores(req.user);
    return res.status(200).json({ ok: true, data: profesores });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleGetProfesorById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID de profesor inválido" });
    }
    const profesor = await getProfesorById(req.user, id);
    if (!profesor) {
      return res.status(404).json({ ok: false, message: "Profesor no encontrado" });
    }
    return res.status(200).json({ ok: true, data: profesor });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleCreateProfesor(req, res) {
  try {
    const { nombre, apellido, password, habilitado } = req.body;
    if (!nombre || !apellido || !password) {
      return res.status(400).json({ ok: false, message: "Nombre, apellido y password son requeridos" });
    }
    const profesor = await createProfesorWithPassword(req.user, nombre, apellido, password, habilitado);
    return res.status(201).json({ ok: true, data: profesor });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ ok: false, message: "Ya existe un profesor con estos datos" });
    }
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleUpdateProfesor(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID de profesor inválido" });
    }
    const { nombre, apellido, habilitado, password } = req.body;
    if (!nombre || !apellido || habilitado === undefined) {
      return res.status(400).json({ ok: false, message: "Nombre, apellido y habilitado son requeridos" });
    }
    const profesor = await updateProfesorById(req.user, id, nombre, apellido, habilitado, password);
    if (!profesor) {
      return res.status(404).json({ ok: false, message: "Profesor no encontrado" });
    }
    return res.status(200).json({ ok: true, data: profesor });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ ok: false, message: "Ya existe un profesor con estos datos" });
    }
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleDeleteProfesor(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID de profesor inválido" });
    }
    const profesor = await deleteProfesorById(req.user, id);
    if (!profesor) {
      return res.status(404).json({ ok: false, message: "Profesor no encontrado" });
    }
    return res.status(200).json({ ok: true, message: "Profesor eliminado exitosamente" });
  } catch (err) {
    console.error(err);
    if (err.code === "23503") {
      return res.status(400).json({ ok: false, message: "No se puede eliminar el profesor porque está asignado a salas" });
    }
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

module.exports = {
  handleGetAllProfesores,
  handleGetProfesorById,
  handleCreateProfesor,
  handleUpdateProfesor,
  handleDeleteProfesor,
};
