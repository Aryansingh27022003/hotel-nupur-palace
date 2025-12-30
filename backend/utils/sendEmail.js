const fetch = require("node-fetch");
const fs = require("fs");

module.exports = async function sendEmail(
  to,
  bookingId,
  pdfPath = null,
  type = "RECEIPT",
  rejectionReason = ""
) {
  let subject = "";
  let html = "";
  let attachments = [];

  /* ================= RECEIPT ================= */
  if (type === "RECEIPT") {
    subject = "Booking Request Received | Hotel Nupur Palace";
    html = `
      <p>Dear Guest,</p>
      <p>Thank you for choosing <b>Hotel Nupur Palace</b>.</p>
      <p>We have successfully received your booking request.</p>
      <p><b>Booking ID:</b> ${bookingId}</p>
      <p>
        Our team is verifying your documents and payment.
        You will receive confirmation within <b>1 hour</b>.
      </p>
      <p>Please do NOT visit the hotel until confirmation.</p>
      <br>
      <p>Warm regards,<br><b>Hotel Nupur Palace</b></p>
    `;
  }

  /* ================= CONFIRMATION ================= */
  if (type === "CONFIRMATION") {
    subject = "Booking Confirmed | Hotel Nupur Palace";
    html = `
      <p>Dear Guest,</p>
      <p>Your booking has been <b>successfully confirmed</b>.</p>
      <p><b>Booking ID:</b> ${bookingId}</p>
      <p>Please find your confirmation attached.</p>
      <br>
      <p>Warm regards,<br><b>Hotel Nupur Palace</b></p>
    `;
  }

  /* ================= REJECTED ================= */
  if (type === "REJECTED") {
    subject = "Booking Rejected | Hotel Nupur Palace";
    html = `
      <p>Dear Guest,</p>
      <p>Your booking (<b>${bookingId}</b>) could not be approved.</p>
      <p><b>Reason:</b><br>${rejectionReason}</p>
      <p>If payment was made, refund will be processed.</p>
      <br>
      <p>Warm regards,<br><b>Hotel Nupur Palace</b></p>
    `;
  }

  /* ================= ATTACHMENT ================= */
  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
    content: fs.readFileSync(pdfPath).toString("base64"),
    name: type === "REJECTED"
        ? `refund-proof-${bookingId}${path.extname(pdfPath)}`
        : `confirmation-${bookingId}.pdf`
    });

  }

  /* ================= SEND VIA BREVO ================= */
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
      to: [{ email: to }],
      subject,
      htmlContent: html,
      attachment: attachments
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error("Brevo email failed: " + err);
  }
};
