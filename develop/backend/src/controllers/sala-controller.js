const {
  getAllSalas,
  getSalaById,
  createSalaWithProfesores,
  updateSalaById,
  deleteSalaById,
} = require("../services/sala-service");

async function handleGetAllSalas(req, res) {
  try {
    const salas = await getAllSalas(req.user);
    return res.status(200).json({ ok: true, data: salas });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleGetSalaById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID de sala inválido" });
    }
    const sala = await getSalaById(req.user, id);
    if (!sala) {
      return res.status(404).json({ ok: false, message: "Sala no encontrada" });
    }
    return res.status(200).json({ ok: true, data: sala });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleCreateSala(req, res) {
  try {
    const { nombre, horaInicio, horaFin, profesorIds, activa } = req.body;
    if (!nombre || !horaInicio || !horaFin || !profesorIds) {
      return res.status(400).json({ ok: false, message: "Nombre, horario y profesores son requeridos" });
    }
    const sala = await createSalaWithProfesores(req.user, nombre, horaInicio, horaFin, profesorIds, activa);
    return res.status(201).json({ ok: true, data: sala });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ ok: false, message: "Ya existe una sala con ese nombre" });
    }
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    if (err.message) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleUpdateSala(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID de sala inválido" });
    }
    const { nombre, horaInicio, horaFin, profesorIds, activa } = req.body;
    if (!nombre || !horaInicio || !horaFin || activa === undefined) {
      return res.status(400).json({ ok: false, message: "Nombre, horario y activa son requeridos" });
    }
    const sala = await updateSalaById(req.user, id, nombre, horaInicio, horaFin, profesorIds, activa);
    if (!sala) {
      return res.status(404).json({ ok: false, message: "Sala no encontrada" });
    }
    return res.status(200).json({ ok: true, data: sala });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ ok: false, message: "Ya existe una sala con ese nombre" });
    }
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    if (err.message) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleDeleteSala(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID de sala inválido" });
    }
    const sala = await deleteSalaById(req.user, id);
    if (!sala) {
      return res.status(404).json({ ok: false, message: "Sala no encontrada" });
    }
    return res.status(200).json({ ok: true, message: "Sala eliminada exitosamente" });
  } catch (err) {
    console.error(err);
    if (err.code === "23503") {
      return res.status(400).json({ ok: false, message: "No se puede eliminar la sala porque tiene alumnos o registros de asistencia" });
    }
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

module.exports = {
  handleGetAllSalas,
  handleGetSalaById,
  handleCreateSala,
  handleUpdateSala,
  handleDeleteSala,
};
