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
    # Se encarga de dar respuesta a las peticiones relacionadas con las reacciones a una publicacion           #
    ############################################################################################################

*/

const { response } = require('express');
const Reaccion = require('../models/reaccion');
const Usuario = require('../models/usuario');
const Publicacion = require('../models/publicacion');
const { HTTP_NOT_FOUND, HTTP_CREATED, HTTP_STATUS_OK, HTTP_NOT_CONTENT } = require('../utils/constantes');
const { httpError } = require('../helpers/handleError');

/*
    ########## REGISTRAR REACCION ##########

    Persiste y retorna la reaccion sobre una publicacion de un usuario
 */
const registarReaccion = async(request, response = response) => {
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

        // Registramos la reaccion
        let reaccion = new Reaccion();
        reaccion.usuario = idUsuario;
        reaccion.publicacion = idPublicacion;

        reaccion = await reaccion.save();

        response.status(HTTP_CREATED).json({
            ok: true,
            reaccion: reaccion
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## GET CANTIDAD REACCIONES BY PUBLICACION ##########

    Retorna la cantidad de reacciones que tiene una publicacion
 */
const getCantidadReaccionesByPublicacion = async(request, response = response) => {
    const idPublicacion = request.params.idPublicacion;

    try {
        const cantReacciones = await Reaccion.find({ 'publicacion': idPublicacion }).count();
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            cantReacciones: cantReacciones
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## IS USUARIO REACCION PUBLICACION ##########

    Retorna true si un usuario ya reacciono a una publicacion
 */
const isUsuarioReaccionPublicacion = async(request, response = response) => {
    const idUsuario = request.params.idUsuario;
    const idPublicacion = request.params.idPublicacion;

    try {
        const reaccion = await Reaccion.findOne(
            {$and: [{ usuario: idUsuario }, { publicacion: idPublicacion }]}
        );

        if (reaccion) {
            return response.status(HTTP_STATUS_OK).json({
                ok: true,
                reaccion: true
            });
        }

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            reaccion: false
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## ELIMINAR REACCION ##########

    Elimina reaccion de un usuario sobre una publicacion
 */
const deleteReaccion = async(request, response = response) => {
    const idPublicacion = request.params.idPublicacion;
    const idUsuario = request.params.idUsuario
    let reaccion
    try {
        reaccion = await Reaccion.findOne(
            {$and: [{ usuario: idUsuario }, { publicacion: idPublicacion }]}
        );
        if (!reaccion) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe la reaccion a eliminar'
            });
        }

        // Eliminamos la reaccion
        await Reaccion.findByIdAndDelete(reaccion.id);
        response.status(HTTP_NOT_CONTENT).json({
            ok: true
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

module.exports = {
    registarReaccion,
    getCantidadReaccionesByPublicacion,
    isUsuarioReaccionPublicacion,
    deleteReaccion
}