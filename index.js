// index.js — Servidor principal de EduGrades
require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const app = express();

// ── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));            // permite peticiones desde el frontend HTML
app.use(express.json());       // parsear JSON en el body

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use("/auth",            require("./routes/auth"));
app.use("/cursos",          require("./routes/cursos"));
app.use("/estudiantes",     require("./routes/estudiantes"));
app.use("/calificaciones",  require("./routes/calificaciones"));
app.use("/historial",       require("./routes/historial"));

// ── Ruta raíz — verificar que el servidor funciona ───────────────────────────
app.get("/", (req, res) => {
  res.json({
    mensaje: "🎓 EduGrades API funcionando correctamente",
    version: "1.0.0",
    rutas: [
      "POST /auth/login",
      "GET  /auth/me",
      "GET  /cursos",
      "GET  /estudiantes?id_curso=1",
      "POST /estudiantes",
      "PUT  /estudiantes/:id",
      "DELETE /estudiantes/:id",
      "GET  /calificaciones?id_estudiante=1",
      "GET  /calificaciones/curso/:id_curso",
      "POST /calificaciones",
      "DELETE /calificaciones/:id",
      "GET  /historial",
    ],
  });
});

// ── Iniciar servidor ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor EduGrades corriendo en http://localhost:${PORT}`);
  console.log(`📋 Rutas disponibles en http://localhost:${PORT}/\n`);
});
