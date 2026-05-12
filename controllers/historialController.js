// controllers/historialController.js
const db = require("../config/db");

// ── GET /historial — Ver todo el historial (solo admin/direccion) ─────────────
async function listar(req, res) {
  const { id_curso, id_usuario, limite = 100 } = req.query;

  try {
    let sql = `
      SELECT
        h.id_historial,
        h.valor_anterior,
        h.valor_nuevo,
        h.descripcion,
        h.fecha,
        u.nombre  AS modificado_por,
        u.rol     AS rol_usuario,
        e.nombre  AS estudiante_nombre,
        e.apellido AS estudiante_apellido,
        m.nombre  AS materia,
        c.periodo,
        cu.nombre AS curso
      FROM historial_modificaciones h
      JOIN usuarios    u  ON h.id_usuario      = u.id_usuario
      JOIN calificaciones c ON h.id_calificacion = c.id_calificacion
      JOIN estudiantes e  ON c.id_estudiante   = e.id_estudiante
      JOIN materias    m  ON c.id_materia       = m.id_materia
      JOIN cursos      cu ON e.id_curso         = cu.id_curso
      WHERE 1=1
    `;
    const params = [];

    if (id_usuario) { sql += " AND h.id_usuario = ?"; params.push(id_usuario); }
    if (id_curso)   { sql += " AND e.id_curso = ?";   params.push(id_curso); }

    sql += " ORDER BY h.fecha DESC LIMIT ?";
    params.push(parseInt(limite));

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener historial." });
  }
}

module.exports = { listar };
