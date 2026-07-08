const { login } = require("../services/auth-service");

async function handleLogin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Nombre de usuario y clave son requeridos" });
    }

    const result = await login(username, password);
    if (!result) {
      return res
        .status(401)
        .json({ ok: false, message: "Credenciales invalidas" });
    }

    return res.status(200).json({
      ok: true,
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, message: "Error interno del servidor" });
  }
}

module.exports = { handleLogin };
