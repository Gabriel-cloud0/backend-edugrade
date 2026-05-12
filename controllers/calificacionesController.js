// controllers/calificacionesController.js
const db = require("../config/db");

// ── GET /calificaciones?id_estudiante=X — Ver notas de un estudiante ─────────
async function listarPorEstudiante(req, res) {
  const { id_estudiante } = req.query;
  if (!id_estudiante) return res.status(400).json({ error: "id_estudiante requerido." });

  try {
    const [rows] = await db.query(
      `SELECT c.id_calificacion, c.id_estudiante, c.periodo, c.nota,
              m.id_materia, m.nombre AS materia, c.fecha_registro
       FROM calificaciones c
       JOIN materias m ON c.id_materia = m.id_materia
       WHERE c.id_estudiante = ?
       ORDER BY m.id_materia, c.periodo`,
      [id_estudiante]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener calificaciones." });
  }
}

// ── GET /calificaciones/curso/:id_curso — Notas completas de un curso ─────────
async function listarPorCurso(req, res) {
  const { id_curso } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT e.id_estudiante, e.nombre, e.apellido,
              m.id_materia, m.nombre AS materia,
              c.id_calificacion, c.periodo, c.nota
       FROM estudiantes e
       LEFT JOIN calificaciones c ON e.id_estudiante = c.id_estudiante
       LEFT JOIN materias m ON c.id_materia = m.id_materia
       WHERE e.id_curso = ?
       ORDER BY e.apellido, e.nombre, m.id_materia, c.periodo`,
      [id_curso]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener calificaciones del curso." });
  }
}

// ── POST /calificaciones — Crear o actualizar una nota ───────────────────────
// Si ya existe (mismo estudiante + materia + periodo) la actualiza (UPSERT)
async function crearOActualizar(req, res) {
  const { id_estudiante, id_materia, periodo, nota } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!id_estudiante || !id_materia || !periodo || nota === undefined) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }
  if (nota < 0 || nota > 100) {
    return res.status(400).json({ error: "La nota debe estar entre 0 y 100." });
  }

  // Verificar que el docente tiene permiso sobre esta materia
  if (req.usuario.rol === "docente") {
    const materiasPermitidas = req.usuario.materias || [];
    const [mat] = await db.query(
      "SELECT nombre FROM materias WHERE id_materia = ?",
      [id_materia]
    );
    if (mat.length === 0 || !materiasPermitidas.includes(mat[0].nombre)) {
      return res.status(403).json({ error: "No tienes permiso para editar esta materia." });
    }
  }

  try {
    // Buscar si ya existe la nota
    const [existing] = await db.query(
      "SELECT id_calificacion, nota FROM calificaciones WHERE id_estudiante=? AND id_materia=? AND periodo=?",
      [id_estudiante, id_materia, periodo]
    );

    let id_calificacion;
    let valor_anterior = null;

    if (existing.length > 0) {
      // UPDATE
      valor_anterior = existing[0].nota;
      id_calificacion = existing[0].id_calificacion;
      await db.query(
        "UPDATE calificaciones SET nota=?, fecha_registro=NOW() WHERE id_calificacion=?",
        [nota, id_calificacion]
      );
    } else {
      // INSERT
      const [result] = await db.query(
        "INSERT INTO calificaciones (id_estudiante, id_materia, periodo, nota) VALUES (?,?,?,?)",
        [id_estudiante, id_materia, periodo, nota]
      );
      id_calificacion = result.insertId;
    }

    // Registrar en historial
    await db.query(
      `INSERT INTO historial_modificaciones
       (id_usuario, id_calificacion, valor_anterior, valor_nuevo, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id_usuario,
        id_calificacion,
        valor_anterior,
        nota,
        `${req.usuario.nombre} modificó nota — Periodo: ${periodo}`,
      ]
    );

    // Recalcular y actualizar boletín del estudiante
    await recalcularBoletin(id_estudiante);

    res.json({
      mensaje: existing.length > 0 ? "Nota actualizada ✅" : "Nota registrada ✅",
      id_calificacion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar la calificación." });
  }
}

// ── DELETE /calificaciones/:id — Eliminar una nota ───────────────────────────
async function eliminar(req, res) {
  const { id } = req.params;
  try {
    const [cal] = await db.query(
      "SELECT id_estudiante FROM calificaciones WHERE id_calificacion=?",
      [id]
    );
    if (cal.length === 0) return res.status(404).json({ error: "Calificación no encontrada." });

    await db.query("DELETE FROM calificaciones WHERE id_calificacion=?", [id]);
    await recalcularBoletin(cal[0].id_estudiante);

    res.json({ mensaje: "Calificación eliminada ✅" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar calificación." });
  }
}

// ── Función interna: recalcular promedio general del boletín ─────────────────
async function recalcularBoletin(id_estudiante) {
  try {
    // Promedio de todas las notas del estudiante
    const [rows] = await db.query(
      `SELECT AVG(nota) AS promedio FROM calificaciones WHERE id_estudiante = ?`,
      [id_estudiante]
    );
    const promedio = rows[0].promedio || 0;
    const anio = new Date().getFullYear();
    const anio_escolar = `${anio}-${anio + 1}`;

    // Upsert boletín
    await db.query(
      `INSERT INTO boletines (id_estudiante, promedio_general, anio_escolar)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE promedio_general = ?, fecha_generacion = NOW()`,
      [id_estudiante, promedio, anio_escolar, promedio]
    );
  } catch (err) {
    console.error("Error recalculando boletín:", err);
  }
}

module.exports = { listarPorEstudiante, listarPorCurso, crearOActualizar, eliminar };
