const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const { router } = require("./routes");

const app = express();
const allowedOrigins = env.frontendUrl
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sin Origin, por ejemplo health checks o herramientas de servidor.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
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
