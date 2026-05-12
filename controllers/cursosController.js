// controllers/cursosController.js
const db = require("../config/db");

// ── GET /cursos — Listar todos los cursos ────────────────────────────────────
async function listar(req, res) {
  const { nivel } = req.query;
  try {
    let sql = "SELECT * FROM cursos";
    const params = [];
    if (nivel) { sql += " WHERE nivel = ?"; params.push(nivel); }
    sql += " ORDER BY nivel, grado, seccion";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al listar cursos." });
  }
}

module.exports = { listar };
