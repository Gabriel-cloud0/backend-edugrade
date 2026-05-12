// routes/estudiantes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/estudiantesController");
const { verificarToken, soloRol } = require("../middleware/auth");

// Todas las rutas requieren token
router.use(verificarToken);

router.get("/",       ctrl.listar);                                          // GET  /estudiantes?id_curso=1
router.post("/",      soloRol("administrador","docente"), ctrl.crear);       // POST /estudiantes
router.put("/:id",    soloRol("administrador","docente"), ctrl.actualizar);  // PUT  /estudiantes/:id
router.delete("/:id", soloRol("administrador"),           ctrl.eliminar);    // DELETE /estudiantes/:id

module.exports = router;
