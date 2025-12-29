const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

      <p>
        Thank you for choosing <b>Hotel Nupur Palace</b>.
      </p>

      <p>
        We have successfully received your booking request.
      </p>

      <p><b>Booking ID:</b> ${bookingId}</p>

      <p>
        Our team is currently verifying your documents and payment.
        You will receive the confirmation email within <b>1 hour</b>.
      </p>

      <p>
        Kindly do not visit the hotel until you receive the
        official <b>Booking Confirmation</b>.
      </p>

      <br>
      <p>
        Warm regards,<br>
        <b>Hotel Nupur Palace</b>
      </p>
    `;
  }

  /* ================= CONFIRMATION ================= */
  if (type === "CONFIRMATION") {
    subject = "Booking Confirmed | Hotel Nupur Palace";
    html = `
      <p>Dear Guest,</p>

      <p>
        We are pleased to inform you that your booking has been
        <b>successfully confirmed</b>.
      </p>

      <p><b>Booking ID:</b> ${bookingId}</p>

      <p>
        Please find your official booking confirmation attached.
      </p>

      <p>
        We look forward to welcoming you.
      </p>

      <br>
      <p>
        Warm regards,<br>
        <b>Hotel Nupur Palace</b>
      </p>
    `;

    // ✅ SAFE ATTACHMENT
    if (pdfPath) {
      attachments.push({
        filename: `${bookingId}.pdf`,
        path: pdfPath
      });
    }
  }

  /* ================= REJECTED ================= */
  if (type === "REJECTED") {
    subject = "Booking Rejected | Hotel Nupur Palace";
    html = `
      <p>Dear Guest,</p>

      <p>
        Thank you for choosing <b>Hotel Nupur Palace</b>.
      </p>

      <p>
        We regret to inform you that your booking request
        (<b>${bookingId}</b>) could not be approved.
      </p>

      <p>
        <b>Reason:</b><br>
        ${rejectionReason}
      </p>

      <p>
        If any payment was made, the refund will be processed shortly.
      </p>

      <br>
      <p>
        Warm regards,<br>
        <b>Hotel Nupur Palace</b>
      </p>
    `;

    // ✅ OPTIONAL: refund proof attachment (no template change)
    if (pdfPath) {
      attachments.push({
        filename: "refund-proof.pdf",
        path: pdfPath
      });
    }
  }

  await transporter.sendMail({
    from: `"Hotel Nupur Palace" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments
  });
};
