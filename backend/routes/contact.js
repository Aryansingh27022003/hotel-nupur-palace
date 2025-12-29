const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post("/send", async (req, res) => {
    try {
        const { email, message } = req.body;

        await transporter.sendMail({
            from: email,
            to: "uttamnupur@gmail.com",
            subject: "New Contact Message - Hotel Nupur Palace",
            text: `From: ${email}\n\nMessage:\n${message}`
        });

        res.status(200).json({ success: true });

    } catch (err) {
        console.error("Email error:", err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
