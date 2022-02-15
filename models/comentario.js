const { Schema, model } = require('mongoose');

const Comentario = Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        require: true
    },
    publicacion: {
        type: Schema.Types.ObjectId,
        ref: 'Publicacion',
        require: true
    },
    comentario: {
        type: String,
        require: true
    },
    createAt: {
        type: Date,
        default: new Date()
    }
}, { collection: 'comentarios' });

Comentario.method('toJSON', function (){
    const { __v, _id, password, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('ComentarioPublicacion', Comentario);