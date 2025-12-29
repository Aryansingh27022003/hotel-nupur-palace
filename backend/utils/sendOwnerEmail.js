const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOwnerEmail(booking) {
  const html = `
    <h2>🛎️ New Booking Confirmed</h2>
    <p><b>Booking ID:</b> ${booking.bookingId}</p>
    <p><b>Name:</b> ${booking.name}</p>
    <p><b>Phone:</b> ${booking.phone}</p>
    <p><b>Email:</b> ${booking.email}</p>
    <p><b>Room:</b> ${booking.roomType}</p>
    <p><b>Check-in:</b> ${booking.checkIn}</p>
    <p><b>Check-out:</b> ${booking.checkOut}</p>
    <p><b>Amount:</b> ₹${booking.amount}</p>
    <p><b>Status:</b> PAID</p>
  `;

  await transporter.sendMail({
    from: `"Hotel Nupur Palace" <${process.env.EMAIL_USER}>`,
    to: "asinghrajput135@gmail.com",   // OWNER EMAIL
    subject: `New Booking: ${booking.bookingId}`,
    html
  });
}

module.exports = sendOwnerEmail;
