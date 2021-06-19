const { Schema, model } = require('mongoose');

const RolSchema = Schema({
    nombreRol: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: new Date()
    }
}, { collection: 'roles' });

RolSchema.method('toJSON', function (){
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('Rol', RolSchema);