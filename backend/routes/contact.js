const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ contact: "route working" });
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

router.post("/send", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false });
    }

    await transporter.sendMail({
      from: `"Hotel Nupur Palace Website" <${process.env.EMAIL_USER}>`,
      to: "uttamnupur@gmail.com",
      replyTo: email,
      subject: "New Contact Message - Hotel Nupur Palace",
      text: `From: ${email}\n\nMessage:\n${message}`
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
