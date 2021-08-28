const { Schema, model } = require('mongoose');

const Reaccion = Schema({
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
    createAt: {
        type: Date,
        default: new Date()
    }
}, { collection: 'reacciones' });

Reaccion.method('toJSON', function (){
    const { __v, _id, password, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('ReaccionPublicacion', Reaccion);