const { Schema, model } = require('mongoose');

const SolicitudAmistadSchema = Schema({
    usuarioEmisor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        require: true
    },
    emailEmisor: {
        type: String,
        required: true
    },
    usuarioReceptor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        require: true
    },
    emailReceptor: {
        type: String,
        required: true
    },
    estado: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: new Date()
    }
}, { collection: 'solicitudes' });

SolicitudAmistadSchema.method('toJSON', function (){
    const { __v, _id, password, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('SolicitudAmistad', SolicitudAmistadSchema);