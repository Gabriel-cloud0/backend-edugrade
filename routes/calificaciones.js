// routes/calificaciones.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/calificacionesController");
const { verificarToken, soloRol } = require("../middleware/auth");

router.use(verificarToken);

router.get("/",              ctrl.listarPorEstudiante);                             // GET /calificaciones?id_estudiante=1
router.get("/curso/:id_curso", ctrl.listarPorCurso);                               // GET /calificaciones/curso/1
router.post("/",             soloRol("administrador","docente"), ctrl.crearOActualizar); // POST /calificaciones
router.delete("/:id",        soloRol("administrador"),           ctrl.eliminar);    // DELETE /calificaciones/:id

module.exports = router;
