const { Schema, model } = require('mongoose');

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
    }
});

UsuarioSchema.method('toJSON', function (){
    const { __v, _id, password, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('Usuario', UsuarioSchema);