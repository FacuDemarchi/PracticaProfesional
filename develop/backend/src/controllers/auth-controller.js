const { login } = require("../services/auth-service");

async function handleLogin(req, res) {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ ok: false, message: "Clave es requerida" });
    }

    const result = await login(password);
    if (!result) {
      return res
        .status(401)
        .json({ ok: false, message: "Clave incorrecta" });
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
