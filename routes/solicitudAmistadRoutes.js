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
    PATH: /api/solicitudes

*/

const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJWT } = require('../middlewares/validarJwt');
const { enviarSolicitudAmistad, obtenerSolicitudesPendientesUsuarioLogueado, aceptarSolicitud, rechazarSolicitud } = require('../controllers/solicitudAmistadController');

const router = Router();

router.post('/enviar-solicitud', [
        validarJWT,
        check('emailEmisor', 'El email del emisor de la solicitud es requerido').not().isEmpty(),
        check('emailEmisor', 'Email no valido').isEmail(),
        check('usuarioEmisor', 'Usuario emisor no valido').isMongoId(),
        check('emailReceptor', 'El email del receptor de la solicitud es requerido').not().isEmpty(),
        check('emailReceptor', 'Email no valido').isEmail(),
        check('usuarioReceptor', 'Usuario receptor no valido').isMongoId(),
        validarCampos
    ],
    enviarSolicitudAmistad
);

router.get('/listar-solicitudes-usuario', validarJWT, obtenerSolicitudesPendientesUsuarioLogueado);

router.put('/aceptar-solicitud/:id', validarJWT, aceptarSolicitud);

router.delete('/rechazar-solicitud/:id', validarJWT, rechazarSolicitud);

module.exports = router;