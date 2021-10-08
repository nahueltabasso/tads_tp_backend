const { Schema, model } = require('mongoose');

const MensajeChatSchema = Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        require: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        require: true
    },
    message: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: new Date()
    }
}, { collection: 'mensajes' });

MensajeChatSchema.method('toJSON', function (){
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model('MensajeChat', MensajeChatSchema);