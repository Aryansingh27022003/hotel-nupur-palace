const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

/* ================= TEST ROUTE ================= */
router.get("/test", (req, res) => {
  res.json({ contact: "route working" });
});

/* ================= SEND CONTACT MESSAGE (BREVO API) ================= */
router.post("/send", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    console.log("📩 Contact message received:");
    console.log("From:", email);
    console.log("Message:", message);

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

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Brevo API failed:", errText);
      return res.status(500).json({ success: false });
    }

    console.log("✅ Email sent successfully via Brevo");
    res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Brevo API error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
