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
    ############################################################################################################
    # Se encarga de dar respuesta a las peticiones relacionadas con los comentarios de una publicacion         #
    ############################################################################################################

*/

const { response } = require('express');
const Comentario = require('../models/comentario');
const Usuario = require('../models/usuario');
const Publicacion = require('../models/publicacion');
const { HTTP_NOT_FOUND, HTTP_CREATED, HTTP_STATUS_OK, HTTP_NOT_CONTENT } = require('../utils/constantes');
const { httpError } = require('../helpers/handleError');

/*
    ########## REGISTRAR COMENTARIO ##########

    Persiste y retorna un comentario sobre una publicacion de un usuario
 */
const registarComentario = async(request, response = response) => {
    const idUsuario = request.params.idUsuario;
    const idPublicacion = request.params.idPublicacion;

    try {
        // Validamos si existe la publicacion
        const publicacionDB = await Publicacion.findById(idPublicacion);
        if (!publicacionDB) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe la publicacion'
            });
        }
        // Validamos si existe el usuario
        const usuarioDB = await Usuario.findById(idUsuario);
        if (!usuarioDB) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe el usuario'
            });
        }

        // Registramos el comentario
        let comentario = new Comentario();
        comentario.usuario = idUsuario;
        comentario.publicacion = idPublicacion;

        comentario = await comentario.save();

        response.status(HTTP_CREATED).json({
            ok: true,
            comentario: comentario
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## GET CANTIDAD COMENTARIOS BY PUBLICACION ##########

    Retorna la cantidad de comentarios que tiene una publicacion
 */
const getCantidadComentariosByPublicacion = async(request, response = response) => {
    const idPublicacion = request.params.idPublicacion;

    try {
        const cantComentarios = await Comentario.find({ 'publicacion': idPublicacion }).count();
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            cantComentarios: cantComentarios
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## IS USUARIO COMENTARIO PUBLICACION ##########

    Retorna true si un usuario ya comentó a una publicacion
 */
const isUsuarioComentarioPublicacion = async(request, response = response) => {
    const idUsuario = request.params.idUsuario;
    const idPublicacion = request.params.idPublicacion;

    try {
        const comentario = await Comentario.findOne(
            {$and: [{ usuario: idUsuario }, { publicacion: idPublicacion }]}
        );

        if (comentario) {
            return response.status(HTTP_STATUS_OK).json({
                ok: true,
                comentario: true
            });
        }

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            comentario: false
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## ELIMINAR COMENTARIO ##########

    Elimina comentario de un usuario sobre una publicacion
 */
const deleteComentario = async(request, response = response) => {
    const idPublicacion = request.params.idPublicacion;
    const idUsuario = request.params.idUsuario
    let comentario
    try {
        comentario = await Comentario.findOne(
            {$and: [{ usuario: idUsuario }, { publicacion: idPublicacion }]}
        );
        if (!comentario) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe el comentario a eliminar'
            });
        }

        // Eliminamos el comentario
        await Comentario.findByIdAndDelete(comentario.id);
        response.status(HTTP_NOT_CONTENT).json({
            ok: true
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

module.exports = {
    registarComentario,
    getCantidadComentariosByPublicacion,
    isUsuarioComentarioPublicacion,
    deleteComentario
}