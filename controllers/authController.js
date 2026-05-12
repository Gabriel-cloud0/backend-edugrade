// controllers/authController.js
const db    = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt   = require("jsonwebtoken");
require("dotenv").config();

// ── POST /login ──────────────────────────────────────────────────────────────
async function login(req, res) {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son requeridos." });
  }

  try {
    // Buscar usuario por correo
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const usuario = rows[0];

    // Verificar contraseña encriptada
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    // Si es docente, obtener sus materias asignadas
    let materias = null;
    if (usuario.rol === "docente") {
      const [mat] = await db.query(
        `SELECT m.id_materia, m.nombre
         FROM docente_materias dm
         JOIN materias m ON dm.id_materia = m.id_materia
         WHERE dm.id_usuario = ?`,
        [usuario.id_usuario]
      );
      materias = mat;
    }

    // Generar token JWT (expira en 8 horas)
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        correo:     usuario.correo,
        rol:        usuario.rol,
        materias:   materias ? materias.map(m => m.nombre) : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      mensaje: "Login exitoso ✅",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        correo:     usuario.correo,
        rol:        usuario.rol,
        materias:   materias ? materias.map(m => m.nombre) : null,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

// ── GET /me — obtener datos del usuario actual ────────────────────────────────
async function perfil(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT id_usuario, nombre, correo, rol, creado_en FROM usuarios WHERE id_usuario = ?",
      [req.usuario.id_usuario]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error interno." });
  }
}

module.exports = { login, perfil };
