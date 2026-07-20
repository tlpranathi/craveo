const dotenv = require("dotenv");
dotenv.config();

const nodemailer = require("nodemailer");
const { welcomeTemplate } = require("../templates/welcomeEmail");
const { orderDeliveredTemplate } = require("../templates/orderDeliveredEmail");
const { passwordChangedTemplate } = require("../templates/passwordChangedEmail");
const { passwordResetTemplate } = require("../templates/passwordResetEmail");

const transporter = nodemailer.createTransport({
    service: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendWelcomeEmail(email, name) {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Craveo",
        html: welcomeTemplate(name),
    });
}

async function sendOrderDeliveredEmail(email, name, items, restaurantName, reviewLink) {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your order has been delivered!",
        html: orderDeliveredTemplate(name, items, restaurantName, reviewLink),
    });
}

async function sendPasswordChangedEmail(email, name, resetLink) {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Craveo password was changed",
        html: passwordChangedTemplate(name, resetLink),
    });
}

async function sendPasswordResetEmail(email, name) {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset your Craveo password",
        html: passwordResetTemplate(name),
    });
}

module.exports = {
    sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendOrderDeliveredEmail
};