// routes/auth.js
const express = require("express");
const router  = express.Router();
const { login, perfil } = require("../controllers/authController");
const { verificarToken }  = require("../middleware/auth");

router.post("/login", login);
router.get("/me",     verificarToken, perfil);

module.exports = router;
