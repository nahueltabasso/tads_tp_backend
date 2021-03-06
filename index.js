/*
_________ _______  ______   _______       _______  _______  ______       _______  _______  _______ _________ _______  _
\__   __/(  ___  )(  __  \ (  ____ \     (  ____ )(  ____ \(  __  \     (  ____ \(  ___  )(  ____ \\__   __/(  ___  )( \
   ) (   | (   ) || (  \  )| (    \/     | (    )|| (    \/| (  \  )    | (    \/| (   ) || (    \/   ) (   | (   ) || (
   | |   | (___) || |   ) || (_____      | (____)|| (__    | |   ) |    | (_____ | |   | || |         | |   | (___) || |
   | |   |  ___  || |   | |(_____  )     |     __)|  __)   | |   | |    (_____  )| |   | || |         | |   |  ___  || |
   | |   | (   ) || |   ) |      ) |     | (\ (   | (      | |   ) |          ) || |   | || |         | |   | (   ) || |
   | |   | )   ( || (__/  )/\____) |     | ) \ \__| (____/\| (__/  )    /\____) || (___) || (____/\___) (___| )   ( || (____/\
   )_(   |/     \|(______/ \_______)_____|/   \__/(_______/(______/_____\_______)(_______)(_______/\_______/|/     \|(_______/
                                   (_____)                        (_____)
    ###################################################################################
    #                                  Archivo index.js                               #
    ###################################################################################

 */

const express = require('express');
const { dbConnection } = require('./config/configDB');
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

// Node Server
const server = require('http').createServer(app);
module.exports.io = require('socket.io')(server, {
    cors: {
        origin: process.env.CLIENT_PATH,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});
require('./sockets/socket');

// Directorio publico
app.use(express.static('public'));

// Paths
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/publicacion', require('./routes/publicacionRoutes'));
app.use('/api/file', require('./routes/fileRoutes'));
app.use('/api/solicitudes', require('./routes/solicitudAmistadRoutes'));
app.use('/api/reaccion', require('./routes/reaccionRoutes'));
app.use('/api/mensaje-chat', require('./routes/mensajeChatRoutes'));
app.use('/api/comentario', require('./routes/comentarioRoutes'));

server.listen(process.env.PORT, (err) => {
    if (err) throw new Error(err);
    console.log('Servidor corriendo en puerto: ' + process.env.PORT);
});

