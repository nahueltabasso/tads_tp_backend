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