const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

/* ================= TEST ROUTE ================= */
router.get("/test", (req, res) => {
  res.json({ contact: "route working" });
});

/* ================= NODEMAILER SETUP ================= */
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
      from: `"Hotel Nupur Palace Website" <${process.env.EMAIL_USER}>`, // ✅ FIX
      to: "uttamnupur@gmail.com",
      replyTo: email, // ✅ user email goes here
      subject: "New Contact Message - Hotel Nupur Palace",
      text: `From: ${email}\n\nMessage:\n${message}`
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Email error:", err); // IMPORTANT
    return res.status(500).json({ success: false, error: "Email failed" });
  }
});

module.exports = router;
