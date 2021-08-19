const { response } = require('express');
const { HTTP_UNAUTHORIZED, HTTP_CREATED, HTTP_INTERNAL_SERVER_ERROR, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_NOT_CONTENT, HTTP_STATUS_OK } = require('../utils/constantes');
const { MSG_ERROR_ADMINISTRADOR } = require('../utils/mensajes');
const { uploadFile, deleteFile } = require('../helpers/uploadFileService');
const Publicacion = require('../models/publicacion');

const registarPublicacion = async(request, response = response) => {
    let body = request.body;
    const idUsuarioLogueado = request.id;
    const tipo = request.params.tipo;

    if (idUsuarioLogueado !== body.usuario) {
        return response.status(HTTP_UNAUTHORIZED).json({
            ok: false,
            msg: 'Se intenta acceder a los datos de otro usuario'
        });
    }

    const tiposValidos = ['publicaciones', 'perfiles'];
    if (!tiposValidos.includes(tipo)) {
        return response.status(HTTP_BAD_REQUEST).json({
            ok: false,
            msg: 'Tipo Invalido'
        });
    }

    // Si llega a este punto implica que el usuario logueado es el mismo del body del request de publicacion
    // Validamos que hay un archivo en el request
    if (!request.files || Object.keys(request.files) === 0) {
        return response.status(HTTP_BAD_REQUEST).json({
            ok: false,
            msg: 'No se encontro ningun archivo'
        });
    }
    const file = request.files.image;

    try {
        // Creamos la instancia del Modelo de Publicacion con los datos del body
        let publicacion = new Publicacion({
            titulo: body.titulo,
            descripcion: body.descripcion,
            usuario: body.usuario
        });

        // Guardamos el archivo en el directorio
        uploadFile(file, 'publicaciones', publicacion);

        await publicacion.save();

        response.status(HTTP_CREATED).json({
            ok: true,
            msg: 'Publicacion subida correctamente!',
            publicacion: publicacion
        });
    } catch (error) {
        console.error(error);
        return response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const deletePublicacion = async(request, response = response) => {
    const idPublicacion = request.params.id;

    try {
        let publicacion = await Publicacion.findById(idPublicacion).populate('usuario', 'id');
        if (!publicacion) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe la publicacion en la base de datos'
            });
        }

        const idUsuario = publicacion.usuario.id;
        // Validacion de seguridad de los datos
        if (idUsuario !== request.id) {
            return response.status(HTTP_UNAUTHORIZED).json({
                ok: false,
                msg: 'Se intenta acceder a los datos de otro usuario'
            });
        }

        // Si pasa la validacion de seguridad de los datos, eliminamos de la base de datos
        const srcImagen = publicacion.srcImagen;
        await Publicacion.findByIdAndDelete(idPublicacion);
        console.log('Publicacion con id: ' + idPublicacion + " eliminada con exito!");
        // Eliminamos la imagen del post del servidor
        deleteFile('publicaciones', srcImagen);
        response.status(HTTP_NOT_CONTENT).json({
            ok: true,
            msg: 'Eliminado con exito!'
        });
    } catch (error) {
        console.log(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const updatePublicacion = async(request, response = response) => {
    const idPublicacion = request.params.id;
    const { titulo, descripcion } = request.body;
    try {
        let publicacion = await Publicacion.findById(idPublicacion).populate('usuario', 'id');
        if (!publicacion) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe la publicacion en la base de datos'
            });
        }

        const idUsuario = publicacion.usuario.id;
        // Validacion de seguridad de los datos
        if (idUsuario !== request.id) {
            return response.status(HTTP_UNAUTHORIZED).json({
                ok: false,
                msg: 'Se intenta acceder a los datos de otro usuario'
            });
        }

        // Actualizamos los datos y persistimos en la base de datos
        publicacion.titulo = titulo;
        publicacion.descripcion = titulo;
        publicacion = await Publicacion.findByIdAndUpdate(idPublicacion, publicacion, { new: true });

        response.status(HTTP_CREATED).json({
            ok: true,
            publicacion: publicacion
        });
    } catch (error) {
        console.log(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const getById = async(request, response = response) => {
    const idPublicacion = request.params.id;

    try {
        let publicacion = await Publicacion.findById(idPublicacion);
        if (!publicacion) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'No existe la publicacion en la base de datos'
            });
        }

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            publicacion: publicacion
        });
    } catch (error) {
        console.log(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const findAllByUsuario = async(request, response = response) => {
    console.log("Entra a findAllByUsuario()");
    const idUsuarioLogueado = request.id;

    try {
        const publicaciones = await Publicacion.find({ 'usuario': idUsuarioLogueado }).sort({ 'createAt': -1 });
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            publicaciones: publicaciones
        });
    } catch (error) {
        console.log(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

module.exports = {
    registarPublicacion,
    deletePublicacion,
    updatePublicacion,
    getById,
    findAllByUsuario
}