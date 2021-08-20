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
    # Middleware validacion del recaptchaV3 de Google                                 #
    ###################################################################################

 */

const { response } = require('express');
const fetch = require('isomorphic-fetch');
const { HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR } = require('../utils/constantes');
const { MSG_ERROR_ADMINISTRADOR } = require('../utils/mensajes');

const verifyGoogleRecaptcha = (request, response = response, next) => {
    const tokenRecaptcha = request.query.recaptcha;
    if (tokenRecaptcha === undefined || tokenRecaptcha === null || tokenRecaptcha === '') {
        return response.status(HTTP_BAD_REQUEST).json({
            ok: false,
            msg: 'Recaptcha requerido!'
        });
    }
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const url =
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${tokenRecaptcha}`;

    // Making POST request to verify captcha
    fetch(url, {
        method: "post",
    })
        .then((res) => res.json())
        .then((google_response) => {
            // google_response is the object return by
            if (google_response.success == true) {
                //   if captcha is verified
                next();
            } else {
                // if captcha is not verified
                return response.status(HTTP_BAD_REQUEST).json({
                    ok: false,
                    msg: 'Recaptcha Invalido!'
                });
            }
        })
        .catch((error) => {
            return response.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                msg: MSG_ERROR_ADMINISTRADOR
            });
        });
}

module.exports = {
    verifyGoogleRecaptcha
}