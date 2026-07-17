import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import { welcomeTemplate } from "../templates/welcomeEmail.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendWelcomeEmail(email, name) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Craveo",
        html: welcomeTemplate(name),
    });
}