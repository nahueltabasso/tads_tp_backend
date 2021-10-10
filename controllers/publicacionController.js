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
    ##############################################################################################
    # Se encarga de dar respuesta a las peticiones relacionadas con las publicaciones de la app  #
    ##############################################################################################

*/

const { response } = require('express');
const { HTTP_UNAUTHORIZED, HTTP_CREATED, HTTP_INTERNAL_SERVER_ERROR, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_NOT_CONTENT, HTTP_STATUS_OK } = require('../utils/constantes');
const { MSG_ERROR_ADMINISTRADOR } = require('../utils/mensajes');
const { uploadFile, deleteFile, uploadFiles } = require('../helpers/uploadFileService');
const Publicacion = require('../models/publicacion');
const Reaccion = require('../models/reaccion');
const { httpError } = require('../helpers/handleError');

/*
    ########## REGISTRAR PUBLICACION ##########

    Registra y retorna la publicacion creada
 */
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
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## REGISTRAR PUBLICACION MULTIPLE FILES ##########

    Registra la publicacion con varios archivos y retorna la publicacion creada
 */
const registarPublicacionMultipleFiles = async(request, response = response) => {
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
    let files;
    if (!request.files || Object.keys(request.files) === 0) {
        files = null;
    } else {
        files = request.files.image;
    }

    try {
        // Creamos la instancia del Modelo de Publicacion con los datos del body
        let publicacion = new Publicacion({
            titulo: body.titulo,
            descripcion: body.descripcion,
            usuario: body.usuario
        });

        // De existir archvos los guardamos
        if (files) {
            // Guardamos los archivos en el directorio
            uploadFiles(files, 'publicaciones', publicacion);
        }

        await publicacion.save();

        response.status(HTTP_CREATED).json({
            ok: true,
            msg: 'Publicacion subida correctamente!',
            publicacion: publicacion
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## ELIMINAR PUBLICACION ##########

    Elimina publicacion por id
 */
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

        // Eliminamos las reacciones de la publicacion
        await Reaccion.deleteMany({publicacion: publicacion.id});

        // Si pasa la validacion de seguridad de los datos, eliminamos de la base de datos
        const srcImagen = publicacion.srcImagen;
        await Publicacion.findByIdAndDelete(idPublicacion);
        console.log('Publicacion con id: ' + idPublicacion + " eliminada con exito!");
        if (srcImagen.length > 0) {
            for (let i = 0; i < srcImagen.length; i ++) {
                // Eliminamos la imagen del post del servidor
                deleteFile('publicaciones', srcImagen[i]);
            }
        }
        response.status(HTTP_NOT_CONTENT).json({
            ok: true,
            msg: 'Eliminado con exito!'
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## ACTUALIZAR PUBLICACION ##########

    Actualiza publicacion por id y retorna la publicacion actualizada
 */
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
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## OBTENER PUBLICACION POR ID ##########

    Retorna una publicacion segun id
 */
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
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## OBTENER PUBLICACIONES USUARIO LOGUEADO ##########

    Retorna las publiaciones segun el id usuario del auth_token del header del request
 */
const findAllByUsuario = async(request, response = response) => {
    console.log("Entra a findAllByUsuario()");
    const idUsuarioLogueado = request.params.idUsuario;

    try {
        const publicaciones = await Publicacion.find({ 'usuario': idUsuarioLogueado }).sort({ 'createAt': -1 });
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            publicaciones: publicaciones
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## OBTENER PUBLICACIONES USUARIO LOGUEADO ##########

    Retorna las publiaciones con paginacion segun el id usuario del auth_token del header del request
 */
const findAllByUsuarioPaginacion = async(request, response = response) => {
    const idUsuarioLogueado = request.params.idUsuario;
    const  { page, size } = request.query;
    const populate = [
        { path: 'usuario', select: 'id nombreApellido srcImagen' }
    ];
    const options = {
        populate,
        limit: size,
        page: page,
        sort: { 'createAt': -1 }
    }
    let criterio = { usuario: idUsuarioLogueado }
    try {

        Publicacion.paginate(criterio, options)
            .then((data) => {
                console.log(data);
                response.status(HTTP_STATUS_OK).json({
                    ok: true,
                    result: data
                });
            });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## OBTENER PUBLICACIONES AMIGOS ##########

    Retorna las publiaciones en base a una lista de ids usuarios
 */
const getPublicacionesAmigos = async(request, response = response) => {
    console.log('IDS AMIGOS: \n', request.params.idsUsuario.split(","));
    const desde = Number(request.query.desde) || 0;
    const totalPorPagina = Number(request.query.totalPorPagina) || 10;
    try {
        if (request.params.idsUsuario.split(",") === undefined || request.params.idsUsuario.split(",") == null) {
            response.status(HTTP_STATUS_OK).json({
                ok: true,
                publicaciones: [],
                totalPublicaciones: 0
            });
        }
        const [ publicaciones, totalPublicaciones ] = await Promise.all([
            Publicacion.find()
                .where('usuario')
                .in(request.params.idsUsuario.split(","))
                .skip(desde)
                .limit(totalPorPagina)
                .populate('usuario', 'id nombreApellido srcImagen google')
                .sort({ 'createAt': -1 }),

            Publicacion.find()
                .where('usuario')
                .in(request.params.idsUsuario.split(","))
                .count()
        ]);

        const p = await Publicacion.find().where('usuario').in(request.params.idsUsuario.split(","));

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            publicaciones: publicaciones,
            totalPublicaciones: totalPublicaciones
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }

}

module.exports = {
    registarPublicacion,
    registarPublicacionMultipleFiles,
    deletePublicacion,
    updatePublicacion,
    getById,
    findAllByUsuario,
    findAllByUsuarioPaginacion,
    getPublicacionesAmigos
}