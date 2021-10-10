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
    # Generacion de tokens de seguridad                                               #
    ###################################################################################

*/

const jwt = require('jsonwebtoken');

const generarJWT = (id, nombre, email) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id,
            nombre,
            email
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '2h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el JWT');
            } else {
                resolve(token);
            }
        });
    });
}

const generarToken = (id, email) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id,
            email
        };

        jwt.sign(payload, process.env.JWT_SECRET_AUTH, {
            expiresIn: '1h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('Ocurrio un error en la generacion del Token');
            } else {
                resolve(token);
            }
        });
    });
}

const comprobarJwtToken = (token = '') => {
    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET)
        return [ true, id ];
    } catch (error) {
        return [false, null ];
    }
}

module.exports = {
    generarJWT,
    generarToken,
    comprobarJwtToken
}