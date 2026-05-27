// index.js — Servidor principal de EduGrades
require("dotenv").config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function initDB() {
  try {
    // Crear tabla si no existe
    await db.execute(`CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100), correo VARCHAR(100) UNIQUE,
      contrasena VARCHAR(255), rol VARCHAR(50)
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS historial_modificaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT, id_calificacion INT,
      valor_anterior FLOAT, valor_nuevo FLOAT,
      fecha DATETIME DEFAULT NOW()
    )`);

    // Insertar usuarios solo si la tabla está vacía
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM usuarios');
    if(rows[0].total === 0){
      const hAdmin = await bcrypt.hash('admin123', 10);
      const hDir   = await bcrypt.hash('dir123', 10);
      const hDoc   = await bcrypt.hash('doc123', 10);
      await db.execute('INSERT INTO usuarios (nombre,correo,contrasena,rol) VALUES (?,?,?,?)', ['Carlos Administrador','admin@escuela.edu',hAdmin,'administrador']);
      await db.execute('INSERT INTO usuarios (nombre,correo,contrasena,rol) VALUES (?,?,?,?)', ['Marta Dirección','direccion@escuela.edu',hDir,'direccion']);
      await db.execute('INSERT INTO usuarios (nombre,correo,contrasena,rol) VALUES (?,?,?,?)', ['Prof. Jiménez','lengua@escuela.edu',hDoc,'docente']);
      await db.execute('INSERT INTO usuarios (nombre,correo,contrasena,rol) VALUES (?,?,?,?)', ['Prof. Rodríguez','matematicas@escuela.edu',hDoc,'docente']);
      await db.execute('INSERT INTO usuarios (nombre,correo,contrasena,rol) VALUES (?,?,?,?)', ['Prof. Castro','ciencias@escuela.edu',hDoc,'docente']);
      await db.execute('INSERT INTO usuarios (nombre,correo,contrasena,rol) VALUES (?,?,?,?)', ['Prof. Herrera','artes@escuela.edu',hDoc,'docente']);
      console.log('✅ Usuarios creados');
    }
    console.log('✅ Base de datos lista');
  } catch(e){ console.error('DB init error:', e.message); }
}
initDB();
const db = require('./config/db');

async function initDB() {
  await db.execute(`CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100), correo VARCHAR(100) UNIQUE,
    contrasena VARCHAR(255), rol VARCHAR(50)
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS historial_modificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT, id_calificacion INT,
    valor_anterior FLOAT, valor_nuevo FLOAT,
    fecha DATETIME DEFAULT NOW()
  )`);
  console.log('✅ Tablas verificadas');
}
initDB().catch(console.error);
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
