const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
        type: [String],
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
}, { collection: 'publicaciones' });

PublicacionSchema.method('toJSON', function (){
    const { __v, _id, password, ...object } = this.toObject();
    object.id = _id;
    return object;
});

PublicacionSchema.plugin(mongoosePaginate);
module.exports = model('Publicacion', PublicacionSchema);