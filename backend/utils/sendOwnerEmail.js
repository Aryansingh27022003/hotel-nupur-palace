const fetch = require("node-fetch");

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
        { email: "palacehotelnupur@gmail.com" } // OWNER EMAIL
      ],
      subject: `New Booking: ${booking.bookingId}`,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error("Brevo owner email failed: " + err);
  }
}

module.exports = sendOwnerEmail;
