/*
_________ _______  ______   _______       _______  _______  ______       _______  _______  _______ _________ _______  _
\__   __/(  ___  )(  __  \ (  ____ \     (  ____ )(  ____ \(  __  \     (  ____ \(  ___  )(  ____ \\__   __/(  ___  )( \
   ) (   | (   ) || (  \  )| (    \/     | (    )|| (    \/| (  \  )    | (    \/| (   ) || (    \/   ) (   | (   ) || (
   | |   | (___) || |   ) || (_____      | (____)|| (__    | |   ) |    | (_____ | |   | || |         | |   | (___) || |
   | |   |  ___  || |   | |(_____  )     |     __)|  __)   | |   | |    (_____  )| |   | || |         | |   |  ___  || |
   | |   | (   ) || |   ) |      ) |     | (\ (   | (      | |   ) |          ) || |   | || |         | |   | (   ) || |
   | |   | )   ( || (__/  )/\____) |     | ) \ \__| (____/\| (__/  )    /\____) || (___) || (____/\___) (___| )   ( || (____/\
   )_(   |/     \|(______/ \_______)_____|/   \__/(_______/(______/_____\_______)(_______)(_______/\_______/|/     \|(_______/
                                   (_____)                        (_____)
    PATH: /api/usuarios

*/

const { Router } = require('express');
const { check } = require('express-validator');
const expressFileUpload = require('express-fileupload');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJWT, validarAdminRole } = require('../middlewares/validarJwt');
const { getAll, updateUsuario, deleteUsuario, getEstadosSentimentales, getUsuarioById, updateProfilePhoto, search, getCantidadAmigosAndCantidadPublicacionesByUsuario, getAmigos, findAllUsuariosPaginados } = require('../controllers/usuarioController');

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

router.get('/search/:termino', validarJWT, search);

router.get('/getCantidadPublicacionesAndCantidadAmigos/:id', validarJWT, getCantidadAmigosAndCantidadPublicacionesByUsuario);

router.get('/getAmigos/:id', validarJWT, getAmigos);

// Endpoint test middleware de adminRole
router.get('/prueba-adminRole/:termino', [validarJWT, validarAdminRole], search);

router.get('/getAllUsuariosPaginados',  [validarJWT, validarAdminRole] , findAllUsuariosPaginados);

module.exports = router;