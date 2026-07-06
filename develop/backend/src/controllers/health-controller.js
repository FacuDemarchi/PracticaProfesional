const { checkDatabaseConnection } = require("../db/pool");

async function getHealth(_req, res) {
  try {
    await checkDatabaseConnection();

    res.status(200).json({
      ok: true,
      service: "backend",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      service: "backend",
      database: "disconnected",
      error: error.message,
    });
  }
}

module.exports = {
  getHealth,
};
