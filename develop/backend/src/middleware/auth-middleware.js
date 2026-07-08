const { verifyToken } = require("../services/auth-service");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, message: "Token de autenticacion requerido" });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ ok: false, message: "Token invalido o expirado" });
  }

  req.user = decoded;
  next();
}

module.exports = { authenticate };
