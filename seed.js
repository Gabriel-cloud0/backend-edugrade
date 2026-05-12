const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  await conn.execute('DELETE FROM usuarios');

  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashDir   = await bcrypt.hash('dir123', 10);
  const hashDoc   = await bcrypt.hash('doc123', 10);

  await conn.execute('INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?,?,?,?)',
    ['Carlos Administrador', 'admin@escuela.edu', hashAdmin, 'administrador']);

  await conn.execute('INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?,?,?,?)',
    ['Marta Dirección', 'direccion@escuela.edu', hashDir, 'direccion']);

  await conn.execute('INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?,?,?,?)',
    ['Prof. Jiménez', 'lengua@escuela.edu', hashDoc, 'docente']);

  await conn.execute('INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?,?,?,?)',
    ['Prof. Rodríguez', 'matematicas@escuela.edu', hashDoc, 'docente']);

  await conn.execute('INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?,?,?,?)',
    ['Prof. Castro', 'ciencias@escuela.edu', hashDoc, 'docente']);

  await conn.execute('INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?,?,?,?)',
    ['Prof. Herrera', 'artes@escuela.edu', hashDoc, 'docente']);

  console.log('✅ Usuarios creados correctamente');
  await conn.end();
}

seed();