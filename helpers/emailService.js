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
    # Servicio de envio de emails                                                     #
    ###################################################################################

*/

const { transporter } = require('../config/emailConfig');
const nodemailer = require('nodemailer');

const enviarEmail = async(from, emailTo, message, link) => {
    // send mail with defined transport object
    try {
        await transporter.sendMail({
            from: `${from} <${process.env.NODEMAILER_USERNAME}>`, // sender address
            to: emailTo, // list of receivers
            subject: from, // Subject line
            //text: "Hello world?", // plain text body
            html: `
            <h1><b>${message}</b></h1>
            <a href="${link}">Link de redireccionamiento</a>
        `,
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    enviarEmail
}