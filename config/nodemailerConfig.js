const nodemailer = require('nodemailer');

const transporter = () =>{
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // `true` for 465, `false` for 587
        auth: {
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,
        }
    });
}

module.exports = transporter;
