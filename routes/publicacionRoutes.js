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
    PATH: /api/publicacion

*/

const { Router } = require('express');
const expressFileUpload = require('express-fileupload');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJWT } = require('../middlewares/validarJwt');
const { registarPublicacion, deletePublicacion, updatePublicacion, getById, findAllByUsuario } = require('../controllers/publicacionController');

const router = Router();
// Lectura y parseo del body
router.use(expressFileUpload());

router.post('/:tipo', [
    validarJWT,
    check('titulo', 'El titulo de la publicacion es requerido').not().isEmpty(),
    check('descripcion', "La descripcion de la publicacion es requerido").not().isEmpty(),
    check('usuario', 'El usuario de la publicacion es requerido').not().isEmpty(),
    check('usuario', 'Usuario no valido').isMongoId(),
    validarCampos
    ],
    registarPublicacion
);

router.put('/:id', [
    validarJWT,
    check('titulo', 'El titulo de la publicacion es requerido').not().isEmpty(),
    check('descripcion', "La descripcion de la publicacion es requerido").not().isEmpty(),
    check('usuario', 'El usuario de la publicacion es requerido').not().isEmpty(),
    check('usuario', 'Usuario no valido').isMongoId(),
    validarCampos
    ],
    updatePublicacion
);

router.get('/:id', [ validarJWT ], getById);

router.delete('/:id', [ validarJWT ], deletePublicacion);

router.get('/getPublicacionesUsuario/:idUsuario', [ validarJWT ], findAllByUsuario)

module.exports = router;