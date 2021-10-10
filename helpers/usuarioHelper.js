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
    # Servicio para el manejo de usuarios                                             #
    ###################################################################################

*/

const SolicitudAmistad = require('../models/solicitudAmistad');

const getIdsUsuariosAmigos = async(idUsuario) => {
    try {
        // Obtenemos los amigos del usuario
        let amigosDB = await SolicitudAmistad.find({
            $or: [
                {$and: [{ usuarioEmisor: idUsuario }, { estado: true }]},
                {$and: [{ usuarioReceptor: idUsuario }, { estado: true }]}
            ]
        }) .populate('usuarioEmisor', 'id')
            .populate('usuarioReceptor', 'id');

        let idsAmigosResponse = [];
        if (amigosDB.length) {
            for (let i = 0; i < amigosDB.length; i++) {
                if (!idsAmigosResponse.includes(amigosDB[i].usuarioEmisor.id)) {
                    idsAmigosResponse.push(amigosDB[i].usuarioEmisor.id);
                }

                if (!idsAmigosResponse.includes(amigosDB[i].usuarioReceptor.id)) {
                    idsAmigosResponse.push(amigosDB[i].usuarioReceptor.id);
                }
            }
        }

        return idsAmigosResponse;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    getIdsUsuariosAmigos
}