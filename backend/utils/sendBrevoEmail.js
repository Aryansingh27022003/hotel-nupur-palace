const fetch = require("node-fetch");
const fs = require("fs");

module.exports = async function sendBrevoEmail({
  to,
  subject,
  text,
  attachmentPath = null
}) {
  const payload = {
    sender: {
      email: process.env.BREVO_SENDER,
      name: "Hotel Nupur Palace"
    },
    to: [{ email: to }],
    subject,
    textContent: text
  };

  if (attachmentPath) {
    payload.attachments = [{
      name: attachmentPath.split("/").pop(),
      content: fs.readFileSync(attachmentPath).toString("base64")
    }];
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error("Brevo email failed: " + err);
  }
};
