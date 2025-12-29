const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

/* ================= CORS FOR CONTACT ROUTE ================= */
/* Contact form is PUBLIC → no cookies, no credentials */
router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://aryansingh27022003.github.io"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
  next();
});

/* ================= HANDLE PREFLIGHT ================= */
router.options("/send", (req, res) => {
  return res.sendStatus(200);
});

/* ================= NODEMAILER ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= SEND CONTACT MESSAGE ================= */
router.post("/send", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    await transporter.sendMail({
      from: `"Hotel Nupur Palace Website" <${process.env.EMAIL_USER}>`,
      to: "uttamnupur@gmail.com",
      replyTo: email,
      subject: "New Contact Message - Hotel Nupur Palace",
      text: `From: ${email}\n\nMessage:\n${message}`
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
