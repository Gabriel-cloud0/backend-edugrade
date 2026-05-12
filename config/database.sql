-- ============================================================
-- EduGrades — Script SQL completo
-- Ejecuta esto en Railway > Query tab
-- ============================================================

-- 1. USUARIOS (docentes, administradores, dirección)
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario    INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100)  NOT NULL,
  correo        VARCHAR(150)  NOT NULL UNIQUE,
  contrasena    VARCHAR(255)  NOT NULL,  -- guardada con bcrypt (encriptada)
  rol           ENUM('administrador','direccion','docente') NOT NULL DEFAULT 'docente',
  creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. MATERIAS (las 6 materias del sistema)
CREATE TABLE IF NOT EXISTS materias (
  id_materia  INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL
);

-- Insertar las 6 materias fijas
INSERT INTO materias (nombre) VALUES
  ('Matemáticas'),
  ('Lengua Española'),
  ('Ciencias Naturales'),
  ('Ciencias Sociales'),
  ('Artística'),
  ('Ed. Física');

-- 3. DOCENTE_MATERIAS (qué materias imparte cada docente)
CREATE TABLE IF NOT EXISTS docente_materias (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario    INT NOT NULL,
  id_materia    INT NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
);

-- 4. CURSOS (1ro A, 1ro B ... 6to A, 6to B — Primaria y Secundaria)
CREATE TABLE IF NOT EXISTS cursos (
  id_curso  INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(20)  NOT NULL,           -- "1ro A"
  nivel     ENUM('primaria','secundaria') NOT NULL,
  grado     INT NOT NULL,                    -- 1,2,3,4,5,6
  seccion   CHAR(1) NOT NULL                 -- 'A' o 'B'
);

-- Insertar los 24 cursos (6 grados x 2 secciones x 2 niveles)
INSERT INTO cursos (nombre, nivel, grado, seccion) VALUES
  ('1ro A','primaria',1,'A'), ('1ro B','primaria',1,'B'),
  ('2do A','primaria',2,'A'), ('2do B','primaria',2,'B'),
  ('3ro A','primaria',3,'A'), ('3ro B','primaria',3,'B'),
  ('4to A','primaria',4,'A'), ('4to B','primaria',4,'B'),
  ('5to A','primaria',5,'A'), ('5to B','primaria',5,'B'),
  ('6to A','primaria',6,'A'), ('6to B','primaria',6,'B'),
  ('1ro A','secundaria',1,'A'), ('1ro B','secundaria',1,'B'),
  ('2do A','secundaria',2,'A'), ('2do B','secundaria',2,'B'),
  ('3ro A','secundaria',3,'A'), ('3ro B','secundaria',3,'B'),
  ('4to A','secundaria',4,'A'), ('4to B','secundaria',4,'B'),
  ('5to A','secundaria',5,'A'), ('5to B','secundaria',5,'B'),
  ('6to A','secundaria',6,'A'), ('6to B','secundaria',6,'B');

-- 5. ESTUDIANTES
CREATE TABLE IF NOT EXISTS estudiantes (
  id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100) NOT NULL,
  id_curso      INT NOT NULL,
  creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE CASCADE
);

-- 6. CALIFICACIONES (una fila por estudiante + materia + período)
CREATE TABLE IF NOT EXISTS calificaciones (
  id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante   INT NOT NULL,
  id_materia      INT NOT NULL,
  periodo         ENUM('P1','P2','P3','P4') NOT NULL,
  nota            DECIMAL(5,2) CHECK (nota >= 0 AND nota <= 100),
  fecha_registro  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
  FOREIGN KEY (id_materia)    REFERENCES materias(id_materia) ON DELETE CASCADE,
  UNIQUE KEY unico_nota (id_estudiante, id_materia, periodo)
);

-- 7. HISTORIAL DE MODIFICACIONES
CREATE TABLE IF NOT EXISTS historial_modificaciones (
  id_historial    INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  id_calificacion INT NOT NULL,
  valor_anterior  DECIMAL(5,2),
  valor_nuevo     DECIMAL(5,2),
  descripcion     VARCHAR(255),
  fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario)      REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_calificacion) REFERENCES calificaciones(id_calificacion) ON DELETE CASCADE
);

-- 8. BOLETINES
CREATE TABLE IF NOT EXISTS boletines (
  id_boletin        INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante     INT NOT NULL,
  promedio_general  DECIMAL(5,2),
  anio_escolar      VARCHAR(10) NOT NULL,  -- "2024-2025"
  fecha_generacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE
);

-- ─── USUARIOS DE PRUEBA ─────────────────────────────────────────────────────
-- Contraseñas encriptadas con bcrypt (equivalen a las del sistema actual)
-- admin123   → para administrador y dirección
-- doc123     → para todos los docentes

INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Carlos Administrador', 'admin@escuela.edu',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lN3a', 'administrador'),
('Marta Dirección', 'direccion@escuela.edu',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lN3a', 'direccion'),
('Prof. Rodríguez', 'matematicas@escuela.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'docente'),
('Prof. Jiménez', 'lengua@escuela.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'docente'),
('Prof. Castro', 'ciencias@escuela.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'docente'),
('Prof. Herrera', 'artes@escuela.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'docente');

-- Asignar materias a docentes
-- Prof. Rodríguez → Matemáticas (id=1)
INSERT INTO docente_materias (id_usuario, id_materia) VALUES (3, 1);
-- Prof. Jiménez → Lengua Española (id=2)
INSERT INTO docente_materias (id_usuario, id_materia) VALUES (4, 2);
-- Prof. Castro → Ciencias Naturales (id=3) + Ciencias Sociales (id=4)
INSERT INTO docente_materias (id_usuario, id_materia) VALUES (5, 3), (5, 4);
-- Prof. Herrera → Artística (id=5) + Ed. Física (id=6)
INSERT INTO docente_materias (id_usuario, id_materia) VALUES (6, 5), (6, 6);
