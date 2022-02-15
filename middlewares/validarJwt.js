const jwt = require('jsonwebtoken');
const { HTTP_UNAUTHORIZED, HTTP_NOT_FOUND } = require('../utils/constantes');
const Usuario = require('../models/usuario')
const Rol = require('../models/rol')

const validarJWT = (request, response, next) => {

    // Leer token
    const token = request.header('Authorization');
    if (!token) {
        return response.status(HTTP_UNAUTHORIZED).json({
            ok: false,
            msg: 'Acceso denegado!'
        });
    }

    try {
        const { id, nombre, email } = jwt.verify(token, process.env.JWT_SECRET)
        request.id = id;
        next();
    } catch (error) {
        return response.status(HTTP_UNAUTHORIZED).json({
            ok: false,
            msg: 'Token Invalido!'
        });
    }

}

const validarAdminRole = async(request, response, next) => {

    try {
        const id = request.id;
        const usuarioDb = await Usuario.findById(id);
        if (!usuarioDb) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'Usuario no existe'
            });
        }

        const rol = await Rol.findById(usuarioDb.rol);

        if (rol.nombreRol !== 'ROLE_ADMIN') {
            return response.status(HTTP_UNAUTHORIZED).json({
                ok: false,
                msg: 'Acceso denegado'
            });
        }
        next();
    } catch (error) {
        return response.status(HTTP_UNAUTHORIZED).json({
            ok: false,
            msg: 'Token Invalido!'
        });
    }
}

module.exports = {
    validarJWT,
    validarAdminRole
}

