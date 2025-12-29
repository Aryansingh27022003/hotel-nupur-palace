const mongoose = require("mongoose");

/* ================= GUEST ================= */
const GuestSchema = new mongoose.Schema({
  name: String,
  age: Number,
  relation: String,
  idProofPath: String
});

/* ================= BOOKING ================= */
const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },

  /* ---- Primary Booker ---- */
  name: String,
  age: Number,
  phone: String,
  whatsapp: String,
  email: String,
  idProofPath: String,

  /* ---- Stay ---- */
  roomType: String,
  checkIn: String,
  checkOut: String,

  /* ---- Travel Info ---- */
/* ---- Travel Info ---- */
  fromPlace: String,
  purpose: String,



  guests: [GuestSchema],

  /* ---- Payment ---- */
  amount: Number,

  paymentProofPath: String,     // user uploaded screenshot / UTR
  receiptPdfPath: String,       // auto-generated receipt

  paymentStatus: {
    type: String,
    enum: ["NOT_PAID", "PAID", "REFUNDED"],
    default: "NOT_PAID"
  },

  /* ---- Admin Decision ---- */
  bookingStatus: {
    type: String,
    enum: ["PENDING_APPROVAL", "APPROVED", "REJECTED"],
    default: "PENDING_APPROVAL"
  },

  rejectionReason: String,      // admin typed reason

  /* ---- Refund Details (IF REJECTED) ---- */
  refundMode: {
    type: String,
    enum: ["UPI", "PHONE"],
  },

  refundValue: String,          // UPI ID or Phone number

  refundProofPath: String,      // admin uploaded refund screenshot

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Booking", BookingSchema);
