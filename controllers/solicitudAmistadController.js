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
    # Se encarga de dar respuesta a las peticiones relacionadas con las solicitudes de amistad entre usuarios  #
    ############################################################################################################

*/

const { response } = require('express');
const SolicitudAmistad = require('../models/solicitudAmistad');
const Usuario = require('../models/usuario');
const { HTTP_CREATED, HTTP_STATUS_OK, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED, HTTP_NOT_FOUND, HTTP_NOT_CONTENT } = require('../utils/constantes');
const { httpError } = require('../helpers/handleError');

/*
    ########## ENVIAR SOLICITUD DE AMISTAD ##########

    Realiza una solicitud de amistad entre dos usuarios
 */
const enviarSolicitudAmistad = async(request, response = response) => {
    const idUsuarioLogueado = request.id;
    let solicitudAmistad = request.body;

    try {
        if (idUsuarioLogueado !== solicitudAmistad.usuarioEmisor) {
            httpError(response, null, HTTP_UNAUTHORIZED, 'Se intenta acceder a los datos de otro usuario');
        }

        // Validamos si los usuarios ya son amigos
        let solicitudDB = await SolicitudAmistad.find({
            $or: [
                {$and: [{ emailEmisor: solicitudAmistad.emailEmisor }, { emailReceptor: solicitudAmistad.emailReceptor }, { estado: true }]}, // Ya son amigos
                {$and: [{ emailEmisor: solicitudAmistad.emailReceptor }, { emailReceptor: solicitudAmistad.emailEmisor }, { estado: true }]}  // Ya son amigos
            ]
        });

        if (solicitudDB.length) {
            return response.status(HTTP_BAD_REQUEST).json({
                ok: false,
                msg: 'Ya son amigos!'
            });
        }

        // Validamos si los usuarios de la solicitud ya tienen alguna solicitud entre si previamente
        solicitudDB = await SolicitudAmistad.find({
            $or: [
                {$and: [{ emailEmisor: solicitudAmistad.emailEmisor }, { emailReceptor: solicitudAmistad.emailReceptor }, { estado: false }]}, // Usuario le envio previamente al receptor una solicitud
                {$and: [{ emailEmisor: solicitudAmistad.emailReceptor }, { emailReceptor: solicitudAmistad.emailEmisor }, { estado: false }]}  // Receptor le envio previamente al usuario una solicitud
            ]
        });

        if (solicitudDB.length) {
            const usuarioReceptor = await Usuario.findById(solicitudAmistad.usuarioReceptor);
            const msg = `Ya haz enviado una solicitud a ${usuarioReceptor.nombreApellido}`
            return response.status(HTTP_BAD_REQUEST).json({
                ok: false,
                msg: msg
            });
        }

        // Validamos que exista el usuario receptor
        const usuarioReceptorDB = await Usuario.findOne({ email: solicitudAmistad.emailReceptor });
        if (!usuarioReceptorDB) {
            return response.status(HTTP_BAD_REQUEST).json({
                ok: false,
                msg: 'No existe el usuario receptor!'
            });
        }

        // Creamos la nueva solicitud de amistad
        let nuevaSolicitudDeAmistad = new SolicitudAmistad(solicitudAmistad);
        await nuevaSolicitudDeAmistad.save();

        response.status(HTTP_CREATED).json({
            ok: true,
            solicitudAmistad: nuevaSolicitudDeAmistad
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## OBTENER SOLICITUDES PENDIENTES ##########

    Retorna una lista de solicitudes pendientes del usuario logueado
 */
const obtenerSolicitudesPendientesUsuarioLogueado = async(request, response = response) => {
    const idUsuarioLogueado = request.id;

    try {
        const solicitudes = await SolicitudAmistad.find({
            $and: [{ usuarioReceptor: idUsuarioLogueado }, { estado: false }]  // Buscamos todas las solicitudes aun pendientes del usuario logueado
        }).populate('usuarioEmisor', 'id nombreApellido email srcImagen');

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            solicitudes: solicitudes
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## ACEPTAR SOLICITUD ##########

    Actualiza el estado de la solicitud
 */
const aceptarSolicitud = async(request, response = response) => {
    const idSolicitud = request.params.id

    try {
        let solicitud = await SolicitudAmistad.findById(idSolicitud);
        if (!solicitud) {
            httpError(response, null, HTTP_NOT_FOUND, 'No existe la solicitud de amistad a aceptar');
        }
        // Aceptamos la solicitud y persistimos en la base de datos
        solicitud.estado = true;
        solicitud = await SolicitudAmistad.findByIdAndUpdate(idSolicitud, solicitud, { new: true });

        response.status(HTTP_STATUS_OK).json({
            ok: true
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## RECHAZAR SOLICITUD ##########

    Elimina la solicitud por su id
 */
const rechazarSolicitud = async(request, response = response) => {
    const idSolicitud = request.params.id

    try {
        let solicitud = await SolicitudAmistad.findById(idSolicitud);
        if (!solicitud) {
            httpError(response, null, HTTP_NOT_FOUND, 'No existe la solicitud de amistad a rechazar');
        }
        // Eliminamos la solicitud para que pueda generarse en un futuro
        await SolicitudAmistad.findByIdAndDelete(idSolicitud);

        response.status(HTTP_NOT_CONTENT).json({
            ok: true
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## GET AMIGOS ##########

    Retorna los ids de los amigos de un usuario en particular
 */
const obtenerIdsAmigos = async(request, response = response) => {
    const idUsuario = request.params.idUsuario;

    try {
        // Obtenemos los amigos del usuario
        let amigosDB = await SolicitudAmistad.find({
            $or: [
                {$and: [{ usuarioEmisor: idUsuario }, { estado: true }]},
                {$and: [{ usuarioReceptor: idUsuario }, { estado: true }]}
            ]
        }) .populate('usuarioEmisor', 'id')
            .populate('usuarioReceptor', 'id');

        let idsAmigosResponse = [];
        if (amigosDB.length) {
            for (let i = 0; i < amigosDB.length; i++) {
                if (!idsAmigosResponse.includes(amigosDB[i].usuarioEmisor.id)) {
                    idsAmigosResponse.push(amigosDB[i].usuarioEmisor.id);
                }

                if (!idsAmigosResponse.includes(amigosDB[i].usuarioReceptor.id)) {
                    idsAmigosResponse.push(amigosDB[i].usuarioReceptor.id);
                }
            }
        }

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            idsAmigos: idsAmigosResponse
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}



module.exports = {
    enviarSolicitudAmistad,
    obtenerSolicitudesPendientesUsuarioLogueado,
    aceptarSolicitud,
    rechazarSolicitud,
    obtenerIdsAmigos,
}