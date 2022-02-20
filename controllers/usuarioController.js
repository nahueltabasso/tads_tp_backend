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
    # Se encarga de dar respuesta a las peticiones relacionadas con los usuarios      #
    ###################################################################################

*/

const { response } = require('express');
const Usuario = require('../models/usuario');
const Publicacion = require('../models/publicacion');
const SolicitudAmistad = require('../models/solicitudAmistad');
const {
    HTTP_STATUS_OK,
    HTTP_INTERNAL_SERVER_ERROR,
    MSG_ERROR_ADMINISTRADOR,
    HTTP_NOT_FOUND,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_NOT_CONTENT,
    HTTP_UNAUTHORIZED,
    SIZE_PERFIL_PHOTO
} = require("../utils/constantes");
const { uploadFile, deleteFile } = require('../helpers/uploadFileService');
const { httpError } = require('../helpers/handleError');
const { getIdsUsuariosAmigos } = require('../helpers/usuarioHelper')

/*
    ########## LISTAR USUARIOS ##########

    Retorna todos los usuarios registrados en la aplicacion
    Nota -> Debe tener rol ROLE_ADMIN
 */
const getAll = async(request, response) => {
    console.log('ID Usuario logueado : ', request.id);
    const usuarios = await Usuario.find({}, 'nombreApellido email telefono fechaNacimiento genero srcImagen biografia hobbies google facebook');

    response.status(HTTP_STATUS_OK).json({
        ok: true,
        usuarios: usuarios
    });
};

/*
    ########## ACTUALIZAR USUARIO ##########

    Actualiza los datos de un usuario mediante su id
 */
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
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## ELIMINAR USUARIO ##########

    Elimina un usuario por su id
 */
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

        if (!usuarioDB.google) {
            deleteFile('perfiles', usuarioDB.srcImagen);
        }

        // Eliminamos el usuario de la base de datos
        const result = await Usuario.deleteOne({ _id : id });

        console.log('Usuario con id: ' + id + " eliminado con exito!");
        response.status(HTTP_NOT_CONTENT).json({
            ok: true,
            msg: 'Usuario borrado con exito!'
        });

    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## OBTENER ESTADOS SENTIMENTALES ##########

    Retorna los estados para completar el perfil o modificar los datos personales
 */
const getEstadosSentimentales = (request, response = response) => {
    const estados = ['Soltero/a', 'En una relacion', 'Casado/a', 'Otro'];

    return response.status(HTTP_STATUS_OK).json({
        ok: true,
        estados: estados
    });
}

/*
    ########## OBTENER USUARIO BY ID ##########

    Retorna un usuario segun su id
 */
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
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## ACTUALIZAR FOTO ##########

    Actualiza foto de perfil del usuario segun id, retorna el usuario actualizado
 */
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
        uploadFile(file, tipo, usuario, SIZE_PERFIL_PHOTO);

        const usuarioActualizado = await Usuario.findByIdAndUpdate(idUsuario, usuario, { new: true });
        const nombreArchivo = usuarioActualizado.srcImagen;
        response.status(HTTP_CREATED).json({
            ok: true,
            usuario: usuarioActualizado,
            nombreArchivo: nombreArchivo
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## SEARCH ##########

    Retorna los usuarios que contengan el parametro en su nombre o email y esten activados
 */
const search = async(request, response = response) => {
    const termino = request.params.termino;
    const regex = new RegExp(termino, 'i');

    try {
        const usuarios = await Usuario.find({
            $or: [
                { nombreApellido: regex },
                { email: regex },
            ],
            estado: true
        });

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            usuarios: usuarios
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

/*
    ########## SEARCH ##########

    Retorna la cantidad de publicaciones y amigos de un usuario
 */
const getCantidadAmigosAndCantidadPublicacionesByUsuario = async(request, response = response) => {
    const id = request.params.id;

    try {
        const [ totalAmigos, totalPublicaciones ] = await Promise.all([
            SolicitudAmistad.find({
                $or: [
                    {$and: [{ usuarioEmisor: id }, { estado: true }]}, // Ya son amigos
                    {$and: [{ usuarioReceptor: id }, { estado: true }]}  // Ya son amigos
                ]
            }).count(),

            Publicacion.find({ 'usuario': id }).count()
        ]);

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            totalAmigos: totalAmigos,
            totalPublicaciones: totalPublicaciones
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
    }
}

const getAmigos = async(request, response = Response) => {
    const idUsuarioLogueado = request.params.id;
    try {
        const idsAmigos = await getIdsUsuariosAmigos(idUsuarioLogueado);

        const usuariosAmigos = await Usuario.find().where('_id').in(idsAmigos);
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            amigos: usuariosAmigos
        });
    } catch (error) {
        httpError(response, error, HTTP_INTERNAL_SERVER_ERROR, MSG_ERROR_ADMINISTRADOR);
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

const findAllUsuariosPaginados = async(request, response = response) => {
    const idUsuarioLogueado = request.params.idUsuario;
    const  { page, size } = request.query;
    const populate = [
        { path: 'usuario', select: 'id nombreApellido srcImagen email' }
    ];
    const options = {
        populate,
        limit: size,
        page: page,
        sort: { 'createAt': -1 }
    }
    let criterio = { usuario: idUsuarioLogueado }
    try {

        Usuario.paginate(criterio, options)
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

module.exports = {
    getAll,
    updateUsuario,
    deleteUsuario,
    getEstadosSentimentales,
    getUsuarioById,
    updateProfilePhoto,
    search,
    getCantidadAmigosAndCantidadPublicacionesByUsuario,
    getAmigos,
    findAllUsuariosPaginados
}