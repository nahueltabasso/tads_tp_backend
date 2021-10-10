const { io } = require('../index');
const { comprobarJwtToken } = require('../helpers/jwt');
const { usuarioConectado, usuarioDesconectado, obtenerAmigosConcentados, saveMensajePrivado } = require('../controllers/socketController');

io.on('connection', async(client) => {

    // TODO: Validar jwt
    let token = client.handshake.auth.token;
    // TODO: Saber que usuario esta activo mediante ID del jwt
    const [ valid, id ] =  comprobarJwtToken(token);

    if (!valid) {     // Si el token no es valido, desconectar
        console.log('Socket no identificado');
        return client.disconnect();
    }

    await usuarioConectado(id);
    console.log('Cliente Conectado', id);

    // TODO: Socket join a una sala especifica de socket.io
    client.join(id);

    // TODO: Emitir todos los usuarios conectados
    io.emit('lista-usuarios-online', await obtenerAmigosConcentados(id));

    // TODO: Escuchar cuando el cliente envia un mensaje
    // mensaje-privado
    client.on('mensaje-privado', async(payload) => {
        console.log('Guardar mensaje en base de datos');
        const mensaje = await saveMensajePrivado(payload);
        io.to(payload.message.to).emit('mensaje-privado', mensaje);         // Emitimos la respuesta del backend al destinatario del msg privado
        io.to(payload.message.from).emit('mensaje-privado', mensaje);       // Emitimos la respuesta al usuario que envio el mensaje
    })

    // TODO: Disconnect
    // Actualizar base de datos

    // TODO: Emitir todos los usuarios conectados
    client.on('disconnect', async() => {
        await usuarioDesconectado(id);
        console.log('Cliente Desconectado', id);
        io.emit('lista-usuarios-online', await obtenerAmigosConcentados(id));
    });
});

