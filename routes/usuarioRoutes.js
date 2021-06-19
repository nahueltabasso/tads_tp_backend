/*
    PATH: /api/usuarios
 */

const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJWT } = require('../middlewares/validarJwt');
const { getAll, updateUsuario, deleteUsuario } = require('../controllers/usuarioController');

const router = Router();

router.get('/', validarJWT, getAll);

router.put('/:id', [
    validarJWT,
    check('nombreApellido', 'El nombre es requerido').not().isEmpty(),
    check('email', 'El email es requerido').not().isEmpty(),
    check('genero', 'El genero es requerido').not().isEmpty(),
    validarCampos
    ],
    updateUsuario
);

router.delete('/:id', validarJWT, deleteUsuario);

module.exports = router;