const jwt = require('jsonwebtoken');

const generarJWT = (id, nombre, email) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id,
            nombre,
            email
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '12h'
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

module.exports = {
    generarJWT,
    generarToken
}