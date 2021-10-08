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
    # Se encarga de dar respuesta a las peticiones relacionadas a los sockets         #
    ###################################################################################

*/

const Usuario = require('../models/usuario');
const MensajeChat = require('../models/mensajeChat');
const { getIdsUsuariosAmigos } = require('../helpers/usuarioHelper');

const usuarioConectado = async(idUsuario) => {
    const usuario = await Usuario.findById(idUsuario);
    usuario.online = true;
    await usuario.save();
    return usuario;
}

const usuarioDesconectado = async(idUsuario) => {
    const usuario = await Usuario.findById(idUsuario);
    usuario.online = false;
    await usuario.save();
    return usuario;
}

const obtenerAmigosConcentados = async(idUsuario) => {
    const idsUsuarios = await getIdsUsuariosAmigos(idUsuario);
    if (idsUsuarios) {
        const usuarios = Usuario.find().where('_id').in(idsUsuarios).sort('-online');
        return usuarios;
    }
    return [];
}

const saveMensajePrivado = async(payload) => {
    try {
        const msg = new MensajeChat(payload.message);
        await msg.save();
        return msg;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    usuarioConectado,
    usuarioDesconectado,
    obtenerAmigosConcentados,
    saveMensajePrivado
}