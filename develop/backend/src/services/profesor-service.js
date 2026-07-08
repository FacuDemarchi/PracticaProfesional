const bcrypt = require("bcrypt");
const { UserTypes } = require("../domain/user");
const {
  findAllProfesores,
  findProfesorById,
  createProfesor,
  updateProfesor,
  deleteProfesor,
} = require("../repositories/profesor-repository");
const { findCredencialByProfesorId } = require("../repositories/credencial-profesor-repository");
const { pool } = require("../db/pool");

function checkAdmin(user) {
  if (user.type !== UserTypes.ADMIN) {
    throw new Error("No autorizado: se requiere permiso de administrador");
  }
}

async function getAllProfesores(user) {
  checkAdmin(user);
  return await findAllProfesores();
}

async function getProfesorById(user, id) {
  checkAdmin(user);
  return await findProfesorById(id);
}

async function createProfesorWithPassword(user, nombre, apellido, password, habilitado = true) {
  checkAdmin(user);
  const client = await pool.connect();
  try {
    await client.query("begin");
    const profesor = await createProfesor(nombre, apellido, habilitado);
    const claveHash = await bcrypt.hash(password, 10);
    await client.query(
      "insert into credencial_profesor (profesor_id, clave_hash) values ($1, $2)",
      [profesor.id, claveHash]
    );
    await client.query("commit");
    return profesor;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

async function updateProfesorById(user, id, nombre, apellido, habilitado, password) {
  checkAdmin(user);
  const client = await pool.connect();
  try {
    await client.query("begin");
    const profesor = await updateProfesor(id, nombre, apellido, habilitado);
    if (password) {
      const claveHash = await bcrypt.hash(password, 10);
      const credencialExistente = await findCredencialByProfesorId(id);
      if (credencialExistente) {
        await client.query(
          "update credencial_profesor set clave_hash = $1, actualizada_en = current_timestamp where profesor_id = $2",
          [claveHash, id]
        );
      } else {
        await client.query(
          "insert into credencial_profesor (profesor_id, clave_hash) values ($1, $2)",
          [id, claveHash]
        );
      }
    }
    await client.query("commit");
    return profesor;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

async function deleteProfesorById(user, id) {
  checkAdmin(user);
  return await deleteProfesor(id);
}

module.exports = {
  getAllProfesores,
  getProfesorById,
  createProfesorWithPassword,
  updateProfesorById,
  deleteProfesorById,
};
