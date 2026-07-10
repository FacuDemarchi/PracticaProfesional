const {
  getAllTomaAsistencias,
  getTomaAsistenciaById,
  getTomaAsistenciasBySalaId,
  createOrUpdateTomaAsistencia,
  deleteTomaAsistenciaById,
} = require("../services/asistencia-service");
const { findAlumnosBySalaId } = require("../repositories/alumno-repository");

async function handleGetAllTomaAsistencias(req, res) {
  try {
    const tomas = await getAllTomaAsistencias(req.user);
    return res.status(200).json({ ok: true, data: tomas });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleGetTomaAsistenciaById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }
    const toma = await getTomaAsistenciaById(req.user, id);
    if (!toma) {
      return res.status(404).json({ ok: false, message: "Toma de asistencia no encontrada" });
    }
    return res.status(200).json({ ok: true, data: toma });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleGetTomaAsistenciasBySalaId(req, res) {
  try {
    const salaId = parseInt(req.params.salaId);
    if (isNaN(salaId)) {
      return res.status(400).json({ ok: false, message: "ID de sala inválido" });
    }
    const tomas = await getTomaAsistenciasBySalaId(req.user, salaId);
    return res.status(200).json({ ok: true, data: tomas });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleCreateOrUpdateTomaAsistencia(req, res) {
  try {
    const { salaId, fecha, detalles } = req.body;
    if (!salaId || !fecha || !detalles) {
      return res.status(400).json({ ok: false, message: "salaId, fecha y detalles son requeridos" });
    }
    const toma = await createOrUpdateTomaAsistencia(req.user, salaId, fecha, detalles);
    return res.status(201).json({ ok: true, data: toma });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    if (
      err.message.includes("no pertenece a la sala") ||
      err.message.includes("no tiene profesores") ||
      err.message.includes("durante el horario de la clase") ||
      err.message.includes("fecha actual") ||
      err.message.includes("La sala no existe")
    ) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleDeleteTomaAsistencia(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }
    const toma = await deleteTomaAsistenciaById(req.user, id);
    if (!toma) {
      return res.status(404).json({ ok: false, message: "Toma de asistencia no encontrada" });
    }
    return res.status(200).json({ ok: true, message: "Toma de asistencia eliminada exitosamente" });
  } catch (err) {
    console.error(err);
    if (err.message.includes("autorizado")) {
      return res.status(403).json({ ok: false, message: err.message });
    }
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

async function handleGetAlumnosBySalaId(req, res) {
  try {
    const salaId = parseInt(req.params.salaId);
    if (isNaN(salaId)) {
      return res.status(400).json({ ok: false, message: "ID de sala inválido" });
    }
    const alumnos = await findAlumnosBySalaId(salaId);
    return res.status(200).json({ ok: true, data: alumnos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

module.exports = {
  handleGetAllTomaAsistencias,
  handleGetTomaAsistenciaById,
  handleGetTomaAsistenciasBySalaId,
  handleCreateOrUpdateTomaAsistencia,
  handleDeleteTomaAsistencia,
  handleGetAlumnosBySalaId,
};
