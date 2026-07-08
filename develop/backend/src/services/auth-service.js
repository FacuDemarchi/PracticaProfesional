const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { findProfesorById } = require("../repositories/profesor-repository");
const { findAllCredenciales } = require("../repositories/credencial-profesor-repository");
const { UserTypes } = require("../domain/user");

async function login(password) {
  // Primero intentamos autenticar como administrador
  if (password === env.adminPassword) {
    const token = jwt.sign(
      {
        role: UserTypes.ADMIN,
      },
      env.jwtSecret,
      { expiresIn: "7d" }
    );
    return { token, user: { role: UserTypes.ADMIN } };
  }

  // Si no es admin, buscamos en las credenciales de profesores
  const credenciales = await findAllCredenciales();
  for (const credencial of credenciales) {
    const passwordMatch = await bcrypt.compare(password, credencial.clave_hash);
    if (passwordMatch) {
      const profesor = await findProfesorById(credencial.profesor_id);
      if (profesor && profesor.habilitado) {
        const token = jwt.sign(
          {
            role: UserTypes.PROFESOR,
            profesorId: profesor.id,
          },
          env.jwtSecret,
          { expiresIn: "7d" }
        );
        return { token, user: { role: UserTypes.PROFESOR, profesorId: profesor.id } };
      }
    }
  }

  // Si no encontramos ninguna coincidencia
  return null;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (err) {
    return null;
  }
}

module.exports = { login, verifyToken };
