const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        h.id,
        h.id_usuario,
        h.valor_anterior,
        h.valor_nuevo,
        h.fecha,
        u.nombre AS nombre_usuario,
        u.rol
      FROM historial_modificaciones h
      LEFT JOIN usuarios u ON h.id_usuario = u.id_usuario
      ORDER BY h.fecha DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch(err) {
    console.error('Error historial:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;