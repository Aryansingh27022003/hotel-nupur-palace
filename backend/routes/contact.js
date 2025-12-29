const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

/* 🔍 TEST ROUTE */
router.get("/test", (req, res) => {
  res.json({ contact: "route working" });
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
    res.status(500).json({ success: false });
  }
});

module.exports = router;
