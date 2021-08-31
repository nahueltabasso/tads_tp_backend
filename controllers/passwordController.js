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
    # Se encarga de dar respuesta a las peticiones relacionadas al password           #
    ###################################################################################

*/

const { response } = require('express');
const {
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND,
    HTTP_STATUS_OK,
} = require('../utils/constantes');
const {
    MESSAGE_RESET_PASSWORD,
    FROM_RESET_PASSWORD,
    HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/mensajes');
const Usuario = require('../models/usuario');
const { generarToken } = require('../helpers/jwt');
const { enviarEmail } = require('../helpers/emailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { httpError } = require('../helpers/handleError');

/*
    ########## SOLICITAR CAMBIO DE PASSWORD ##########

    Genera y envia email con el token para el seteo de password
 */
const forgotPassword = async(request, response = response) => {
    const emailUsuario = request.query.email;
    const telefonoUsuario = request.query.telefono;
    if (!emailUsuario) {
        return response.status(HTTP_BAD_REQUEST).json({
            ok: false,
            msg: 'El email es requerido!'
        });
    }
    try {
        // Validamos si existe el usuario con el email del request
        let usuario = await Usuario.findOne({ email: emailUsuario });
        if (!usuario) {
            httpError(response, null, HTTP_NOT_FOUND, 'No existe un usuario con el email proporcionado');
        }

        if (!usuario.estado) {
            httpError(response, null, HTTP_BAD_REQUEST, 'El usuario no se encuentra activo');
        }

        // Al llegar hasta este punto el usuario existe en la base de datos
        let tokenVerification = telefonoUsuario == null ? await generarToken(usuario.id, usuario.email) : getCodigo();

        // Asignamos el token al usuario y persistimos los cambios en la base de datos
        usuario.resetToken = tokenVerification;
        usuario = await Usuario.findByIdAndUpdate(usuario.id, usuario, { new: true });
        console.log(usuario.resetToken)

        if (telefonoUsuario != null) {
            const message = 'El codigo para el restablecimiento de contraseña es ' + tokenVerification;
            // Realizamos el request a la api
            const data = await axios.post(process.env.WSP_URL, {
                message: message,
                to: telefonoUsuario
            }, { headers: process.env.WSP_API_KEY });

            if (data.status) {
                return response.status(HTTP_STATUS_OK).json({
                    ok: true,
                    msg: 'WhatsApp enviado!'
                });
            }
        }
        // Envio de email con token para solicitar cambio de contraseña
        const from = FROM_RESET_PASSWORD;
        const message = MESSAGE_RESET_PASSWORD;
        const link = `${process.env.CLIENT_PATH}/reset-password?token=${tokenVerification}`;
        const emailStatus = enviarEmail(from, usuario.email, message, link);

        if (!emailStatus) {
            throw Error('Ocurrio un error con el envio del Email');
        }

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            emailStatus: emailStatus
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## MODIFICAR PASSWORD ##########

    Encripta y actualiza el usuario con la nueva password
 */
const resetPassword = async(request, response = response) => {
    const { newPassword, resetToken } = request.body;
    if (!(resetToken && newPassword)) {
        return response.status(HTTP_BAD_REQUEST).json({
            ok: false,
            msg: 'El token y la contraseña son requeridos!'
        });
    }

    let tokenIsValido
    try {
        // Validamos que el token sea valido y no haya expirado
        tokenIsValido = jwt.verify(resetToken, process.env.JWT_SECRET_AUTH);
        let usuario = await Usuario.findOne({ resetToken: resetToken });

        if (!usuario) {
            httpError(response, null, HTTP_NOT_FOUND, 'El token no corresponde a ningun usuario activo');
        }
        // Encriptar la nueva contraseña del usuario
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(newPassword, salt);
        // Volvemos a establecer el resetToken igual a null
        usuario.resetToken = null;
        usuario = await Usuario.findByIdAndUpdate(usuario.id, usuario, { new: true });
        
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            msg: 'Contraseña modificada!'
        });
    } catch (error) {
        httpError(response, error, HTTP_NOT_FOUND, MSG_ERROR_ADMINISTRADOR);
    }
}

const getCodigo = () => {
    let codigo = '';
    for (let i = 0; i < 8; i++) {
        let number = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
        codigo = codigo + number;
    }
    return codigo;


}

module.exports = {
    forgotPassword,
    resetPassword
}