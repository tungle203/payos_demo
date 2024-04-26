const nodemailer = require('nodemailer');
require('dotenv').config();
const sendEmailConfig = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

module.exports = sendEmailConfig;
