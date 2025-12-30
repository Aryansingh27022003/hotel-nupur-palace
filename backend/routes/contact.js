const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

/* ================= TEST ROUTE ================= */
router.get("/test", (req, res) => {
  res.json({ contact: "route working" });
});

/* ================= BREVO SMTP TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // smtp-relay.brevo.com
  port: Number(process.env.SMTP_PORT),// 587
  secure: false,                      // MUST be false for 587
  auth: {
    user: process.env.SMTP_USER,      // 9eff14001@smtp-brevo.com
    pass: process.env.SMTP_PASS       // Brevo SMTP KEY
  }
});

/* ================= SEND CONTACT MESSAGE ================= */
router.post("/send", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false });
    }

    await transporter.sendMail({
      from: `"Hotel Nupur Palace Website" <${process.env.SMTP_USER}>`,
      to: "uttamnupur@gmail.com",
      replyTo: email,
      subject: "New Contact Message - Hotel Nupur Palace",
      text: `From: ${email}\n\nMessage:\n${message}`
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Email error:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
