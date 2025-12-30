/* =========================================================
   receipt.js — FINAL WORKING VERSION
   ========================================================= */

const bookingIdEl = document.getElementById("bookingId");
const downloadBtn = document.getElementById("downloadReceipt");

// Get bookingId from URL
const params = new URLSearchParams(window.location.search);
const bookingId = params.get("bookingId");

if (!bookingId) {
  alert("Invalid receipt link");
} else {
  // Show booking ID
  bookingIdEl.innerText = bookingId;

  // IMPORTANT: set download link
  downloadBtn.href = `https://hotel-nupur-palace.onrender.com/receipts/${bookingId}.pdf`;

  // Optional: set filename explicitly
  downloadBtn.setAttribute("download", `${bookingId}-receipt.pdf`);
}
