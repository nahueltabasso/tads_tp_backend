/*
    PATH: /api/auth
 */

const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJWT } = require('../middlewares/validarJwt');
const { registrarUsuario, activeAccount, getRoles, login, googleLogin, facebookLogin, generateRefreshToken  } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { verifyGoogleRecaptcha } = require('../middlewares/validarRecaptcha');

const router = Router();

router.post('/signup', [
    check('nombreApellido', 'El nombre es requerido').not().isEmpty(),
    check('email', 'El email es requerido').not().isEmpty(),
    check('email', 'Email no valido').isEmail(),
    check('password', 'La contraseña es requerida').not().isEmpty(),
    check('fechaNacimiento', 'La fecha de nacimiento es requerida').not().isEmpty(),
    check('genero', 'El genero es requerido').not().isEmpty(),
    validarCampos,
    verifyGoogleRecaptcha,
    ],
    registrarUsuario
);

router.post("/active-account",
    activeAccount
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

router.post("/refresh-token", [
        validarJWT
    ],
    generateRefreshToken
);

router.post("/password/forgot-password", [
        check('email', 'El email del usuario es requerido').not().isEmpty(),
        check('email', 'Email no valido').isEmail(),
        validarCampos
    ],
    forgotPassword
);

router.post("/password/reset-password", validarCampos, resetPassword);

router.get('/getRoles', getRoles);

module.exports = router;