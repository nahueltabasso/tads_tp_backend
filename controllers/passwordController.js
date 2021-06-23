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

const forgotPassword = async(request, response = response) => {
    const emailUsuario = request.query.email;
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
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe un usuario con el email proporcionado!'
            });
        }

        if (!usuario.estado) {
            return response.status(HTTP_BAD_REQUEST).json({
                ok: false,
                msg: 'El usuario no se encuentra activo'
            });
        }

        // Al llegar hasta este punto el usuario existe en la base de datos
        const mensaje = 'Revisar tu email para poder restablecer tu contraseña!';
        let tokenVerification = await generarToken(usuario.id, usuario.email);
        // Asignamos el token al usuario y persistimos los cambios en la base de datos
        usuario.resetToken = tokenVerification;
        usuario = await Usuario.findByIdAndUpdate(usuario.id, usuario, { new: true });

        // Envio de email con token para solicitar cambio de contraseña
        const from = FROM_RESET_PASSWORD;
        const message = MESSAGE_RESET_PASSWORD;
        const link = `${process.env.CLIENT_PATH}/restablecer-password?token=${tokenVerification}`;
        const emailStatus = enviarEmail(from, usuario.email, message, link);

        if (!emailStatus) {
            throw Error('Ocurrio un error con el envio del Email');
        }

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            emailStatus: emailStatus
        });
    } catch (error) {
        console.log(error);
        return response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }

}

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
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'El token no corresponde a ningun usuario activo'
            });
        }
        // Encriptar la nueva contraseña del usuario
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(newPassword, salt);
        usuario = await Usuario.findByIdAndUpdate(usuario.id, usuario, { new: true });
        
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            msg: 'Contraseña modificada!'
        });
    } catch (error) {
        console.log(error);
        return response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

module.exports = {
    forgotPassword,
    resetPassword
}