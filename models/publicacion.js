const { Schema, model } = require('mongoose');

const PublicacionSchema = Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    srcImagen: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: new Date()
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        require: true
    }
});

PublicacionSchema.method('toJSON', function (){
    const { __v, _id, password, ...object } = this.toObject();
    object.id = _id;
    return object;
}, { collection: 'publicaciones' });

module.exports = model('Publicacion', PublicacionSchema);