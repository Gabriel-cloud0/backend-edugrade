// controllers/estudiantesController.js
const db = require("../config/db");

// ── GET /estudiantes?id_curso=1 — Listar estudiantes de un curso ─────────────
async function listar(req, res) {
  const { id_curso } = req.query;
  if (!id_curso) return res.status(400).json({ error: "id_curso es requerido." });

  try {
    const [rows] = await db.query(
      `SELECT e.id_estudiante, e.nombre, e.apellido, e.id_curso,
              c.nombre AS curso, c.nivel, c.grado, c.seccion
       FROM estudiantes e
       JOIN cursos c ON e.id_curso = c.id_curso
       WHERE e.id_curso = ?
       ORDER BY e.apellido, e.nombre`,
      [id_curso]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar estudiantes." });
  }
}

// ── POST /estudiantes — Crear estudiante ─────────────────────────────────────
async function crear(req, res) {
  const { nombre, apellido, id_curso } = req.body;

  if (!nombre || !apellido || !id_curso) {
    return res.status(400).json({ error: "nombre, apellido e id_curso son requeridos." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO estudiantes (nombre, apellido, id_curso) VALUES (?, ?, ?)",
      [nombre, apellido, id_curso]
    );
    res.status(201).json({
      mensaje: "Estudiante creado ✅",
      id_estudiante: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear estudiante." });
  }
}

// ── PUT /estudiantes/:id — Actualizar estudiante ─────────────────────────────
async function actualizar(req, res) {
  const { id } = req.params;
  const { nombre, apellido, id_curso } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE estudiantes SET nombre=?, apellido=?, id_curso=? WHERE id_estudiante=?",
      [nombre, apellido, id_curso, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado." });
    }
    res.json({ mensaje: "Estudiante actualizado ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar estudiante." });
  }
}

// ── DELETE /estudiantes/:id — Eliminar estudiante ────────────────────────────
async function eliminar(req, res) {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM estudiantes WHERE id_estudiante = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado." });
    }
    res.json({ mensaje: "Estudiante eliminado ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar estudiante." });
  }
}

module.exports = { listar, crear, actualizar, eliminar };
