const fetch = require("node-fetch");

async function sendBrevoEmail({ to, subject, text, attachmentPath }) {
  const body = {
    sender: {
      name: "Hotel Nupur Palace",
      email: process.env.BREVO_SENDER
    },
    to: [{ email: to }],
    subject,
    textContent: text
  };

  // ✅ ATTACHMENT SUPPORT
  if (attachmentPath) {
    const fs = require("fs");
    const path = require("path");

    const fileContent = fs.readFileSync(attachmentPath).toString("base64");

    body.attachment = [
      {
        content: fileContent,
        name: path.basename(attachmentPath)
      }
    ];
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return true;
}

module.exports = sendBrevoEmail;
