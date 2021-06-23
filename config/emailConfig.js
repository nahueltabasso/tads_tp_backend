const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.NODEMAILER_USERNAME, // generated ethereal user
        pass: process.env.NODEMAILER_PASSWORD, // generated ethereal password
    },
});

transporter.verify().then(() => {
    console.log('Servicio de envio de mails activado!');
})

module.exports = {
    transporter
}