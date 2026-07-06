const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const schemaPath =
  process.env.SCHEMA_PATH ||
  path.resolve(__dirname, "../../diseño/schema.sql");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL no esta definida.");
  process.exit(1);
}

async function applySchema() {
  const sql = fs.readFileSync(schemaPath, "utf8");
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await pool.query(sql);
    console.log(`Schema aplicado correctamente desde ${schemaPath}`);
  } finally {
    await pool.end();
  }
}

applySchema().catch((error) => {
  console.error("No se pudo aplicar el schema:", error);
  process.exit(1);
});
