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
    ###################################################################################
    # Se encarga de dar respuesta a las peticiones relacionadas a los chats           #
    ###################################################################################

*/

const { response } = require('express');
const MensajeChat = require('../models/mensajeChat');
const { HTTP_STATUS_OK, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR } = require('../utils/constantes');
const { httpError } = require('../helpers/handleError');

const obtenerChat = async(request, response = response) => {
    const idUsuarioLogueado = request.id;
    const mensajeFrom = request.params.from;

    try {
        const last20Messages = await MensajeChat.find({
            $or: [
                { from: idUsuarioLogueado, to: mensajeFrom },
                { from: mensajeFrom, to: idUsuarioLogueado },
            ]
        })
            .sort({ createAt: 'asc' })
            .limit(20);

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            mensajes: last20Messages
        });
    } catch (error) {
        console.error(error);
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }



}

module.exports = {
    obtenerChat
}