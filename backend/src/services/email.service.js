const dotenv = require("dotenv");
dotenv.config();

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const { welcomeTemplate } = require("../templates/welcomeEmail");
const { orderDeliveredTemplate } = require("../templates/orderDeliveredEmail");
const { passwordChangedTemplate } = require("../templates/passwordChangedEmail");
const { passwordResetTemplate } = require("../templates/passwordResetEmail");

async function sendWelcomeEmail(email, name) {
    return resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Welcome to Craveo",
        html: welcomeTemplate(name),
    });
}

async function sendOrderDeliveredEmail(email, name, items, restaurantName, reviewLink) {
    return resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Your order has been delivered!",
        html: orderDeliveredTemplate(
            name,
            items,
            restaurantName,
            reviewLink
        ),
    });
}

async function sendPasswordChangedEmail(email, name, resetLink) {
    return resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Your Craveo password was changed",
        html: passwordChangedTemplate(name, resetLink),
    });
}

async function sendPasswordResetEmail(email, name, resetLink) {
    return resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset your Craveo password",
        html: passwordResetTemplate(name, resetLink),
    });
}

module.exports = {
    sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendOrderDeliveredEmail
};