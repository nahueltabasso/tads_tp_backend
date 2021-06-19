/*
    Middleware generico para la validacion de los campos de los modelos
 */
const { response } = require('express');
const { validationResult } = require('express-validator');

const validarCampos = (request, response = response, next) => {
    const errores = validationResult(request);
    if(!errores.isEmpty()) {
        return response.status(400).json({
            ok: false,
            errors: errores.mapped()
        });
    }

    // Supera el middleware
    next();
}

module.exports = {
    validarCampos
}