/*
    PATH: /api/auth
 */

const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { registrarUsuario, getRoles, login, googleLogin, facebookLogin  } = require('../controllers/authController');

const router = Router();

router.post('/signup', [
    check('nombreApellido', 'El nombre es requerido').not().isEmpty(),
    check('email', 'El email es requerido').not().isEmpty(),
    check('email', 'Email no valido').isEmail(),
    check('password', 'La contraseña es requerida').not().isEmpty(),
    check('fechaNacimiento', 'La fecha de nacimiento es requerida').not().isEmpty(),
    check('genero', 'El genero es requerido').not().isEmpty(),
    validarCampos
    ],
    registrarUsuario
);

router.post("/signin", [
    check('email', 'El email es requerido').not().isEmpty(),
    check('email', 'Email no valido').isEmail(),
    check('password', 'La contraseña es requerida').not().isEmpty(),
    validarCampos
    ],
    login
);

router.post("/google-signin", [
        check('token', 'El token de Google es requerido').not().isEmpty(),
        validarCampos
    ],
    googleLogin
);

router.post("/facebook-signin", [
        check('token', 'El token de Facebook es requerido').not().isEmpty(),
        validarCampos
    ],
    facebookLogin
);

router.get('/getRoles', getRoles);

module.exports = router;