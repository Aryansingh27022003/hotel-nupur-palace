const express = require("express");

const router = express.Router();

/* ================= TEST ROUTE ================= */
router.get("/test", (req, res) => {
  res.json({ contact: "route working" });
});

/* ================= SEND CONTACT MESSAGE ================= */
router.post("/send", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing email or message"
      });
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER,
          name: "Hotel Nupur Palace"
        },
        to: [
          { email: "uttamnupur@gmail.com" }
        ],
        replyTo: { email },
        subject: "New Contact Message - Hotel Nupur Palace",
        textContent: `From: ${email}\n\nMessage:\n${message}`
      })
    });

    const data = await response.text(); // IMPORTANT

    if (!response.ok) {
      console.error("❌ Brevo response:", data);
      return res.status(500).json({
        success: false,
        error: "Email service failed"
      });
    }

    console.log("✅ Email sent via Brevo");
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Brevo API error:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
