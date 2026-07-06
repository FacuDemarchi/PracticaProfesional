const { Pool } = require("pg");
const { env } = require("../config/env");

if (!env.databaseUrl) {
  console.warn(
    "DATABASE_URL no esta definida. Configurala antes de intentar conectarte a la base."
  );
}

const pool = new Pool({
  connectionString: env.databaseUrl || undefined,
  ssl: env.databaseUrl
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

async function checkDatabaseConnection() {
  const client = await pool.connect();

  try {
    await client.query("select 1");
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  checkDatabaseConnection,
};
