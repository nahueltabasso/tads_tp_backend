const express = require('express');
const { dbConnection } = require('./database/configDB');
const cors = require('cors')
require('dotenv').config();

// Creamos el servidor express
const app = express();

// Configuracion de CORS
app.use(cors());

// Lectura y parseo del body
app.use(express.json());

// Base de datos
dbConnection();

// Directorio publico
app.use(express.static('public'));

// Paths
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en puerto: ' + process.env.PORT);
});

