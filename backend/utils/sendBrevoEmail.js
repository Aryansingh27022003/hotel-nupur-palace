const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

module.exports = async function sendBrevoEmail({
  to,
  subject,
  text,
  attachmentPath = null
}) {
  if (!to) {
    throw new Error("Recipient email missing");
  }

  const payload = {
    sender: {
      email: process.env.BREVO_SENDER,
      name: "Hotel Nupur Palace"
    },
    to: [{ email: to }],
    subject,
    textContent: text
  };

  /* ================= ATTACHMENT (SAFE) ================= */
  if (attachmentPath) {
    const absPath = path.resolve(attachmentPath);

    if (fs.existsSync(absPath)) {
      const fileBuffer = fs.readFileSync(absPath);

      // ❗ Brevo rejects empty or invalid files
      if (fileBuffer.length > 0) {
        payload.attachments = [
          {
            name: path.basename(absPath),
            content: fileBuffer.toString("base64")
          }
        ];
      } else {
        console.warn("⚠️ Attachment file is empty:", absPath);
      }
    } else {
      console.warn("⚠️ Attachment file not found:", absPath);
    }
  }

  /* ================= SEND EMAIL ================= */
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("Brevo email failed: " + errText);
  }

  console.log("✅ Email sent successfully via Brevo");
};
