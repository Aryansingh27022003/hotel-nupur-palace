const fetch = require("node-fetch");
const path = require("path");
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
      <div style="font-family: Arial, sans-serif; color: #333; max-width:600px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
        <h2 style="color:#b22222; text-align:center;">Hotel Nupur Palace</h2>
        <p>Dear Guest,</p>
        <p>Thank you for choosing <strong>Hotel Nupur Palace</strong>.</p>
        <p>We have successfully received your booking request. Our team will review your details and confirm your booking shortly.</p>
        <table style="width:100%; margin:15px 0; border-collapse: collapse;">
          <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Booking ID:</strong></td><td style="padding:8px; border:1px solid #ddd;">${bookingId}</td></tr>
        </table>
        <p>Please do <strong>not visit the hotel</strong> until confirmation is received.</p>
        <p>Warm regards,<br><strong>Hotel Nupur Palace</strong></p>
        <hr style="border:none; border-top:1px solid #ccc;">
        <small style="color:#777;">This is an automated message. Please do not reply.</small>
      </div>
    `;
  }

  /* ================= CONFIRMATION ================= */
  if (type === "CONFIRMATION") {
    subject = "Booking Confirmed | Hotel Nupur Palace";
    html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width:600px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
        <h2 style="color:#228B22; text-align:center;">Booking Confirmed!</h2>
        <p>Dear Guest,</p>
        <p>We are delighted to inform you that your booking has been <strong>successfully confirmed</strong>.</p>
        <table style="width:100%; margin:15px 0; border-collapse: collapse;">
          <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Booking ID:</strong></td><td style="padding:8px; border:1px solid #ddd;">${bookingId}</td></tr>
        </table>
        <p>Please find your booking confirmation attached with this email.</p>
        <p>We look forward to welcoming you to <strong>Hotel Nupur Palace</strong>.</p>
        <p>Warm regards,<br><strong>Hotel Nupur Palace</strong></p>
        <hr style="border:none; border-top:1px solid #ccc;">
        <small style="color:#777;">This is an automated message. Please do not reply.</small>
      </div>
    `;
  }

  /* ================= REJECTED ================= */
  if (type === "REJECTED") {
    subject = "Booking Rejected | Hotel Nupur Palace";
    html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width:600px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
        <h2 style="color:#b22222; text-align:center;">Booking Not Approved</h2>
        <p>Dear Guest,</p>
        <p>We regret to inform you that your booking (<strong>${bookingId}</strong>) could not be approved.</p>
        <table style="width:100%; margin:15px 0; border-collapse: collapse;">
          <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Reason:</strong></td><td style="padding:8px; border:1px solid #ddd;">${rejectionReason || "Not specified"}</td></tr>
        </table>
        <p>If you made a payment, please find the refund proof attached.</p>
        <p>We apologize for any inconvenience caused and hope to serve you in the future.</p>
        <p>Warm regards,<br><strong>Hotel Nupur Palace</strong></p>
        <hr style="border:none; border-top:1px solid #ccc;">
        <small style="color:#777;">This is an automated message. Please do not reply.</small>
      </div>
    `;
  }

  /* ================= ATTACHMENT ================= */
  /* ================= ATTACHMENT ================= */
if (pdfPath && pdfPath.startsWith("http")) {
  const res = await fetch(pdfPath);
  const buffer = await res.buffer();

let filename = `document-${bookingId}.pdf`;

if (type === "CONFIRMATION") {
  filename = `booking-confirmation-${bookingId}.pdf`;
}

if (type === "REJECTED") {
  filename = `refund-proof-${bookingId}.pdf`;
}

if (type === "RECEIPT") {
  filename = `payment-receipt-${bookingId}.pdf`;
}

attachments.push({
  content: buffer.toString("base64"),
  name: filename
});

}

// If pdfPath doesn't exist, attachments remains empty. No problem, email still sends.


  /* ================= SEND VIA BREVO ================= */
/* ================= SEND VIA BREVO ================= */

const payload = {
  sender: {
    email: process.env.BREVO_SENDER,
    name: "Hotel Nupur Palace"
  },
  to: [{ email: to }],
  subject,
  htmlContent: html
};

// ✅ Add attachment ONLY if exists
if (attachments.length > 0) {
  payload.attachment = attachments;
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
