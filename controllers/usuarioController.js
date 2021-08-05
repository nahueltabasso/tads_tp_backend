const { response } = require('express');
const Usuario = require('../models/usuario');
const {
    HTTP_STATUS_OK,
    HTTP_INTERNAL_SERVER_ERROR,
    MSG_ERROR_ADMINISTRADOR,
    HTTP_NOT_FOUND,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_NOT_CONTENT,
    HTTP_UNAUTHORIZED
} = require("../utils/constantes");
const { uploadFile, deleteFile } = require('../helpers/uploadFileService');

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
        let usuarioDB = await Usuario.findById(id);
        // Validamos si existe el usuario con el id parametro en la base de datos
        if (!usuarioDB) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe el usuario en la base de datos'
            });
        }

        const body = request.body;
        console.log(body);
        if (usuarioDB.email !== body.email) {
            existeEmail = await Usuario.findOne({ email: email });
            if (existeEmail) {
                return response.status(HTTP_BAD_REQUEST).json({
                    ok: false,
                    msg: 'Ya existe un usuario con el email' + email
                });
            }
        }

        // Actualizamos el usuario
        usuarioDB = actualizarCamposUsuarios(usuarioDB, body);
        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, usuarioDB, { new: true });      // new: true para que retorne el usuario actualizado

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

const getEstadosSentimentales = (request, response = response) => {
    const estados = ['Soltero/a', 'En una relacion', 'Casado/a', 'Otro'];

    return response.status(HTTP_STATUS_OK).json({
        ok: true,
        estados: estados
    });
}

const getUsuarioById = async(request, response = response) => {
    const idUsuario = request.params.id;
    let usuario;
    try {
        usuario = await Usuario.findById(idUsuario);
        if (!usuario) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe el usuario'
            });
        }

        return response.status(HTTP_STATUS_OK).json({
            ok: true,
            usuario: usuario
        });
    } catch (error) {
        console.log(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const updateProfilePhoto = async(request, response = response) => {
    const idUsuario = request.params.id;
    const tipo = request.params.tipo;
    let usuario;

    try {
        usuario = await Usuario.findById(idUsuario);
        if (!usuario) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe el usuario'
            });
        }

        if (usuario.id !== idUsuario) {
            return response.status(HTTP_UNAUTHORIZED).json({
                ok: false,
                msg: 'Se intenta acceder a los datos de otro usuario'
            });
        }

        const tiposValidos = ['perfiles'];
        if (!tiposValidos.includes(tipo)) {
            return response.status(HTTP_BAD_REQUEST).json({
                ok: false,
                msg: 'Tipo Invalido'
            });
        }

        // Validamos que haya algun archivo en el request
        if (!request.files || Object.keys(request.files) === 0) {
            return response.status(HTTP_BAD_REQUEST).json({
                ok: false,
                msg: 'No se encontro ningun archivo'
            });
        }

        const file = request.files.image;
        // Eliminamos la foto de perfil si existe
        if (usuario.srcImagen) {
            deleteFile('perfiles', usuario.srcImagen);
        }
        // Guardamos el archivo
        uploadFile(file, tipo, usuario);

        const usuarioActualizado = await Usuario.findByIdAndUpdate(idUsuario, usuario, { new: true });
        response.status(HTTP_CREATED).json({
            ok: true,
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error(error);
        return response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const actualizarCamposUsuarios = (usuario = Usuario, usuarioBody) => {
    usuario.email = usuarioBody.email;
    usuario.nombreApellido = usuarioBody.nombreApellido;
    usuario.telefono = usuarioBody.telefono;
    usuario.fechaNacimiento = usuarioBody.fechaNacimiento;
    usuario.genero = usuarioBody.genero;
    usuario.biografia = usuarioBody.biografia;
    usuario.hobbies = usuarioBody.hobbies;
    usuario.pais = usuarioBody.pais;
    usuario.situacionSentimental = usuarioBody.situacionSentimental;
    return usuario;
}

module.exports = {
    getAll,
    updateUsuario,
    deleteUsuario,
    getEstadosSentimentales,
    getUsuarioById,
    updateProfilePhoto
}