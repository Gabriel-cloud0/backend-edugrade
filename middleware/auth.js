// middleware/auth.js
// Este middleware verifica el token JWT en cada petición protegida

const jwt = require("jsonwebtoken");
require("dotenv").config();

function verificarToken(req, res, next) {
  // El token llega en el header: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Acceso denegado. No hay token." });
  }

  const token = authHeader.split(" ")[1]; // quitar "Bearer "

  if (!token) {
    return res.status(401).json({ error: "Token inválido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // guarda los datos del usuario en la petición
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token expirado o inválido." });
  }
}

// Middleware para verificar rol específico
function soloRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${roles.join(" o ")}`,
      });
    }
    next();
  };
}

module.exports = { verificarToken, soloRol };
