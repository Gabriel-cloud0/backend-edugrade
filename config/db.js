// config/db.js
// Conexión a MySQL usando las credenciales del archivo .env

const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Verificar conexión al arrancar
connection.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Error conectando a la base de datos:", err.message);
  } else {
    console.log("✅ Conectado a MySQL (Railway)");
    conn.release();
  }
});

module.exports = connection.promise();
