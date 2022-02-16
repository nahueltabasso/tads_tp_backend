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
    PATH: /api/reaccion

*/

const { Router } = require('express');
const { validarJWT } = require('../middlewares/validarJwt');
const { registarComentario, getCantidadComentariosByPublicacion, isUsuarioComentarioPublicacion, deleteComentario } = require('../controllers/comentarioController');

const router = Router();

router.post('/', validarJWT, registarComentario);

router.get('/getCantidadComentariosByPublicacion/:idPublicacion', validarJWT, getCantidadComentariosByPublicacion);

router.get('/isUsuarioComentario/:idPublicacion/:idUsuario', validarJWT, isUsuarioComentarioPublicacion);

router.delete('/:idPublicacion/:idUsuario', validarJWT, deleteComentario);

module.exports = router;