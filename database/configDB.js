const mongoose = require('mongoose');

const dbConnection = async() => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Conexion a MongoDB realizada con exito! Base de datos online!')
    } catch (error) {
        console.log(error);
        throw new Error('Error en la conexion a la base de datos!');
    }
}

module.exports = {
    dbConnection
}

