const jwt = require('jsonwebtoken');
const { HTTP_UNAUTHORIZED } = require('../utils/constantes');

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
        const { id, nombreApellido, email } = jwt.verify(token, process.env.JWT_SECRET);
        request.id = id;
        next();
    } catch (error) {
        return response.status(HTTP_UNAUTHORIZED).json({
            ok: false,
            msg: 'Token Invalido!'
        });
    }
}

module.exports = {
    validarJWT
}