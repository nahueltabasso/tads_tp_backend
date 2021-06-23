const { response } = require('express');
const Usuario = require('../models/usuario');
const {
    HTTP_STATUS_OK,
    HTTP_INTERNAL_SERVER_ERROR,
    MSG_ERROR_ADMINISTRADOR,
    HTTP_NOT_FOUND,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_NOT_CONTENT
} = require("../utils/constantes");

const getAll = async(request, response) => {
    console.log('ID Usuario logueado : ', request.id);
    const usuarios = await Usuario.find({}, 'nombreApellido email telefono fechaNacimiento genero srcImagen biografia hobbies google facebook');

    response.status(HTTP_STATUS_OK).json({
        ok: true,
        usuarios: usuarios
    });
};

const updateUsuario = async(request, response = response) => {
    console.log('ID Usuario logueado : ', request.id);
    const id = request.params.id;
    try{
        const usuarioDB = await Usuario.findById(id);
        // Validamos si existe el usuario con el id parametro en la base de datos
        if (!usuarioDB) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe el usuario en la base de datos'
            });
        }

        const { password, google, faceboook, email, ...campos} = request.body;
        if (usuarioDB.email !== email) {
            existeEmail = await Usuario.findOne({ email: email });
            if (existeEmail) {
                return response.status(HTTP_BAD_REQUEST).json({
                    ok: false,
                    msg: 'Ya existe un usuario con el email' + email
                });
            }
        }
        camposBody.email = email;
        // Actualizamos el usuario
        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, camposBody, { new: true });      // new: true para que retorne el usuario actualizado

        response.status(HTTP_CREATED).json({
            ok: true,
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        })
    }
}

const deleteUsuario = async(request, response = response) => {
    console.log('ID Usuario logueado : ', request.id);
    const id = request.params.id;
    try{
        const usuarioDB = await Usuario.findById(id);
        // Validamos si existe el usuario con el id parametro en la base de datos
        if (!usuarioDB) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe el usuario en la base de datos'
            });
        }

        // Eliminamos el usuario de la base de datos
        await Usuario.findByIdAndDelete(id);
        console.log('Usuario con id: ' + id + " eliminado con exito!");

        response.status(HTTP_NOT_CONTENT).json({
            ok: true,
            msg: 'Usuario borrado con exito!'
        });
    } catch (error) {
        console.error(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        })
    }
}

module.exports = {
    getAll,
    updateUsuario,
    deleteUsuario
}