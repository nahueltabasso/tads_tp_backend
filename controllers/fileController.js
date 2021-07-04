const { response } = require('express');
const { HTTP_STATUS_OK, HTTP_INTERNAL_SERVER_ERROR } = require('../utils/constantes');
const { MSG_ERROR_ADMINISTRADOR } = require('../utils/mensajes');
const { getFile } = require('../helpers/uploadFileService');

const viewFile = async(request, response = response) => {
    const tipo = request.params.tipo;
    const file = request.params.tipo;

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