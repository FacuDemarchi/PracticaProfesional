const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { findProfesorByNombreApellido } = require("../repositories/profesor-repository");
const { findCredencialByProfesorId } = require("../repositories/credencial-profesor-repository");
const { UserTypes } = require("../domain/user");

async function login(nombreUsuario, password) {
  if (nombreUsuario === "admin") {
    if (password === env.adminPassword) {
      const token = jwt.sign(
        {
          type: UserTypes.ADMIN,
        },
        env.jwtSecret,
        { expiresIn: "7d" }
      );
      return { token, user: { type: UserTypes.ADMIN } };
    }
  }

  const [nombre, apellido] = nombreUsuario.split(" ");
  if (!nombre || !apellido) {
    return null;
  }

  const profesor = await findProfesorByNombreApellido(nombre, apellido);
  if (!profesor) {
    return null;
  }

  if (!profesor.habilitado) {
    return null;
  }

  const credencial = await findCredencialByProfesorId(profesor.id);
  if (!credencial) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, credencial.clave_hash);
  if (!passwordMatch) {
    return null;
  }

  const token = jwt.sign(
    {
      type: UserTypes.PROFESOR,
      profesorId: profesor.id,
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );

  return { token, user: { type: UserTypes.PROFESOR, profesorId: profesor.id } };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (err) {
    return null;
  }
}

module.exports = { login, verifyToken };
