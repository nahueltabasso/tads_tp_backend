/*
    PATH: /api/usuarios
 */

const { Router } = require('express');
const { check } = require('express-validator');
const expressFileUpload = require('express-fileupload');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJWT } = require('../middlewares/validarJwt');
const { getAll, updateUsuario, deleteUsuario, getEstadosSentimentales, getUsuarioById, updateProfilePhoto } = require('../controllers/usuarioController');

const router = Router();
// Lectura y parseo del body
router.use(expressFileUpload());

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

router.get('/getEstadosSentimentales', validarJWT, getEstadosSentimentales);

router.get('/:id', validarJWT, getUsuarioById)

router.put('/actualizarFotoPerfil/:tipo/:id', validarJWT, updateProfilePhoto);

module.exports = router;