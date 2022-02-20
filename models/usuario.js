const { Schema, model } = require('mongoose');
const Publicacion = require('./publicacion');
const Comentario = require('./comentario');
const Reaccion = require('./reaccion');
const SolicitudAmistad = require('./solicitudAmistad');
const { deleteFilesFromPublicaciones } = require('../helpers/uploadFileService');

const UsuarioSchema = Schema({
    nombreApellido: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    telefono: {
        type: String
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
    genero: {
        type: String,
        required: true
    },
    srcImagen: {
        type: String
    },
    biografia: {
        type: String
    },
    situacionSentimental: {
        type: String
    },
    telefono: {
        type: String
    },
    hobbies: {
        type: String
    },
    estado: {
        type: Boolean,
        default: false
    },
    google: {
        type: Boolean,
        default: false
    },
    facebook: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: new Date()
    },
    rol: {
        type: Schema.Types.ObjectId,
        ref: 'Rol',
        require: true
    },
    pais: {
        type: String,
        require: true
    },
    tokenActivacion: {
        type: String,
        require: true
    },
    resetToken: {
        type: String
    },
    primerLogin: {
        type: Number,
        default: 0
    },
    online: {
        type: Boolean,
        default: false
    }
});

UsuarioSchema.method('toJSON', function (){
    const { __v, _id, password, ...object } = this.toObject();
    object.id = _id;
    return object;
});

UsuarioSchema.pre('deleteOne', { query: true }, async function(done, next) {
    console.info("Entra al pre DeleteOneUsuario()");
    const id = this.getFilter()["_id"]
    // Recupero todas las publicaciones del usuario
    const publicaciones = await Publicacion.find({ usuario: id });
    let idsPublicaciones = [];
    publicaciones.forEach(p => idsPublicaciones.push(p.id));
    // Eliminamos los archivos de cloudinary
    await deleteFilesFromPublicaciones(publicaciones);
    console.info("Archivos del usuario ID: " + id + " eliminados de Cloudinary");
    await Publicacion.deleteMany({ usuario: id});
    console.info("Publicaciones del usuario ID: " + id + " eliminadas!");

    await Reaccion.deleteMany({
        $or: [
            {$and: [{ usuario: id }]},
            {$and: [{ publicacion: { $in: idsPublicaciones } }]}
        ]
    });
    console.info("Reacciones del usuario ID: " + id + " eliminadas!");

    await Comentario.deleteMany({
        $or: [
            {$and: [{ usuario: id }]},
            {$and: [{ publicacion: { $in: idsPublicaciones } }]}
        ]
    });
    console.info("Comentarios del usuario ID: " + id + " eliminadas!");

    await SolicitudAmistad.deleteMany({
        $or: [
            {$and: [{ usuarioEmisor: id }]},
            {$and: [{ usuarioReceptor: id }]}
        ]
    });
    console.log("Solicitudes del usuario ID: " + id + " eliminadas!");
    next();
});

module.exports = model('Usuario', UsuarioSchema);