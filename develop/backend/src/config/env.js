const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  schemaPath:
    process.env.SCHEMA_PATH ||
    path.resolve(__dirname, "../../../diseño/schema.sql"),
};

module.exports = { env };
