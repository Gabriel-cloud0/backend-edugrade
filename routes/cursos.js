// routes/cursos.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/cursosController");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken);
router.get("/", ctrl.listar); // GET /cursos?nivel=primaria

module.exports = router;
