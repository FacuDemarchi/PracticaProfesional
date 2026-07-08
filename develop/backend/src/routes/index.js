const express = require("express");
const { getHealth } = require("../controllers/health-controller");
const { handleLogin } = require("../controllers/auth-controller");
const {
  handleGetAllProfesores,
  handleGetProfesorById,
  handleCreateProfesor,
  handleUpdateProfesor,
  handleDeleteProfesor,
} = require("../controllers/profesor-controller");
const {
  handleGetAllSalas,
  handleGetSalaById,
  handleCreateSala,
  handleUpdateSala,
  handleDeleteSala,
} = require("../controllers/sala-controller");
const {
  handleGetAlumnos,
  handleGetAlumnoById,
  handleCreateAlumno,
  handleUpdateAlumno,
} = require("../controllers/alumno-controller");
const {
  handleGetAllTomaAsistencias,
  handleGetTomaAsistenciaById,
  handleGetTomaAsistenciasBySalaId,
  handleCreateOrUpdateTomaAsistencia,
  handleDeleteTomaAsistencia,
  handleGetAlumnosBySalaId,
} = require("../controllers/asistencia-controller");
const { authenticate } = require("../middleware/auth-middleware");

const router = express.Router();

router.get("/health", getHealth);
router.post("/login", handleLogin);

router.get("/profesores", authenticate, handleGetAllProfesores);
router.get("/profesores/:id", authenticate, handleGetProfesorById);
router.post("/profesores", authenticate, handleCreateProfesor);
router.put("/profesores/:id", authenticate, handleUpdateProfesor);
router.delete("/profesores/:id", authenticate, handleDeleteProfesor);

router.get("/salas", authenticate, handleGetAllSalas);
router.get("/salas/:id", authenticate, handleGetSalaById);
router.post("/salas", authenticate, handleCreateSala);
router.put("/salas/:id", authenticate, handleUpdateSala);
router.delete("/salas/:id", authenticate, handleDeleteSala);

router.get("/alumnos", authenticate, handleGetAlumnos);
router.get("/alumnos/:id", authenticate, handleGetAlumnoById);
router.post("/alumnos", authenticate, handleCreateAlumno);
router.put("/alumnos/:id", authenticate, handleUpdateAlumno);
router.get("/salas/:salaId/alumnos", authenticate, handleGetAlumnosBySalaId);

router.get("/asistencias", authenticate, handleGetAllTomaAsistencias);
router.get("/asistencias/:id", authenticate, handleGetTomaAsistenciaById);
router.get("/salas/:salaId/asistencias", authenticate, handleGetTomaAsistenciasBySalaId);
router.post("/asistencias", authenticate, handleCreateOrUpdateTomaAsistencia);
router.delete("/asistencias/:id", authenticate, handleDeleteTomaAsistencia);

module.exports = { router };
