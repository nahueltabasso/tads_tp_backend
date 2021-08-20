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
    # Se encarga de dar respuesta a las peticiones relacionadas a mostrar archivos    #
    ###################################################################################

*/

const { response } = require('express');
const { HTTP_STATUS_OK, HTTP_INTERNAL_SERVER_ERROR } = require('../utils/constantes');
const { MSG_ERROR_ADMINISTRADOR } = require('../utils/mensajes');
const { getFile } = require('../helpers/uploadFileService');

/*
    ########## VER ARCHIVO ##########

    retorna el path del archivo
 */
const viewFile = async(request, response = response) => {
    const tipo = request.params.tipo;
    const file = request.params.file;

    const tiposValidos = ['publicaciones', 'perfiles'];
    if (!tiposValidos.includes(tipo)) {
        return response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        })
    }

    const pathFile = await getFile(tipo, file);
    response.status(HTTP_STATUS_OK).sendFile(pathFile);
}

module.exports = {
    viewFile
}