const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const { router } = require("./routes");

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "asistencia-backend",
  });
});

app.use("/api", router);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    ok: false,
    message: "Error interno del servidor",
  });
});

module.exports = { app };
