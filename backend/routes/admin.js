const express = require("express");
const Booking = require("../models/Booking");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendBrevoEmail = require("../utils/sendBrevoEmail");
const multer = require("multer");

const router = express.Router();

/* ================= MULTER (REFUND PROOF) ================= */
const upload = multer({
  dest: path.join(__dirname, "..", "uploads")
});



/* ================= GET BOOKINGS (WITH FILTERS) ================= */
router.get("/bookings", async (req, res) => {
  if (!req.session.admin) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const { room, status, from, to, search } = req.query;
    const filter = {};

    if (room) filter.roomType = room;
    if (status) filter.bookingStatus = status;

    if (from && to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(from),
        $lte: end
      };
    }

    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }
      ];
    }

    const bookings = await Booking
      .find(filter)
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    console.error("Admin bookings error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* ================= APPROVE BOOKING ================= */
router.post("/approve/:bookingId", async (req, res) => {
  if (!req.session.admin) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.bookingStatus = "APPROVED";
    booking.paymentStatus = "PAID";
    await booking.save();

    /* ================= PREMIUM CONFIRMATION PDF ================= */
    const pdfDir = path.join(__dirname, "..", "confirmations");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

    const pdfPath = path.join(pdfDir, `${booking.bookingId}.pdf`);
    const doc = new PDFDocument({ size: "A4", margin: 55 });
    doc.pipe(fs.createWriteStream(pdfPath));

    /* ---------- PAGE BORDER ---------- */
    doc.rect(30, 30, 535, 782).stroke("#cccccc");

    /* ---------- WATERMARK ---------- */
    doc.save();
    doc.rotate(-30, { origin: [300, 420] });
    doc.fontSize(42)
      .fillColor("#f0f0f0")
      .text("HOTEL NUPUR PALACE", 120, 380, { align: "center" });
    doc.restore();

    /* ---------- HEADER ---------- */
    doc.fillColor("black");
    doc.font("Helvetica-Bold")
      .fontSize(22)
      .text("Hotel Nupur Palace", 0, 85, { align: "center" });

    doc.font("Helvetica")
      .fontSize(10)
      .fillColor("gray")
      .text("Official Booking Confirmation", 0, 115, { align: "center" });

    doc.moveTo(55, 140).lineTo(540, 140).stroke();
    doc.y = 165;

    /* ---------- DETAILS TABLE ---------- */
    doc.font("Helvetica-Bold")
      .fontSize(15)
      .fillColor("black")
      .text("Booking Details", 85);

    doc.moveDown(2);

    const labelX = 85;
    const valueX = 270;
    const rowHeight = 26;
    let y = doc.y;

    const drawRow = (label, value) => {
      doc.font("Helvetica")
        .fontSize(11)
        .fillColor("#444")
        .text(label, labelX, y);

      doc.font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("black")
        .text(value || "—", valueX, y, { width: 250 });

      y += rowHeight;
    };

    drawRow("Booking ID", booking.bookingId);
    drawRow("Primary Guest", booking.name);
    drawRow("Mobile Number", booking.phone);
    drawRow("WhatsApp", booking.whatsapp);
    drawRow("Email Address", booking.email);
    drawRow("Room Type", booking.roomType);
    drawRow("Check-in Date", booking.checkIn);
    drawRow("Check-out Date", booking.checkOut);
    drawRow("Amount Paid", `Rs ${booking.amount}`);
    drawRow("Payment Status", "PAID");

    doc.rect(70, doc.y - rowHeight * 10 - 15, 420, rowHeight * 10 + 30).stroke();

    /* ---------- GUEST LIST ---------- */
    doc.moveDown(3);

    /* ---------- INSTRUCTIONS ---------- */
    doc.moveDown(2);
    const noteTopY = doc.y;

    doc.font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("red")
      .text("Important Check-in Instructions", 85, noteTopY);

    doc.moveDown(1);
    doc.font("Helvetica")
      .fontSize(11)
      .fillColor("black")
      .text(
        "• Please carry ORIGINAL government-issued ID proof for all guests.\n\n" +
        "• Check-in Time: 12:00 PM | Check-out Time: 11:00 AM.\n\n" +
        "• This confirmation must be shown at reception.",
        85,
        doc.y,
        { width: 360 }
      );

    doc.rect(70, noteTopY - 15, 420, 135).stroke();

    /* ---------- FOOTER ---------- */
    doc.moveDown(3);
    doc.fontSize(9.5)
      .fillColor("gray")
      .text(
        "This is a system-generated document. No signature required.\nHotel Nupur Palace",
        { align: "center" }
      );

    doc.end();

    /* ---------- EMAIL ---------- */
    await sendBrevoEmail({
  to: booking.email,
  subject: "Booking Confirmed – Hotel Nupur Palace",
  text: `
Dear ${booking.name},

Your booking has been APPROVED.

Booking ID: ${booking.bookingId}
Room Type: ${booking.roomType}
Check-in: ${booking.checkIn}
Check-out: ${booking.checkOut}

Please find the attached confirmation PDF.

Hotel Nupur Palace
`,
  attachmentPath: pdfPath
});


    res.json({ success: true });

  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ error: "Approval failed" });
  }
});


/* ================= REJECT + REFUND ================= */
router.post(
  "/reject/:bookingId",
  upload.single("refundProof"),
  async (req, res) => {
    if (!req.session.admin) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { reason, refundMode, refundValue } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({ error: "Rejection reason is mandatory" });
      }

      const booking = await Booking.findOne({ bookingId: req.params.bookingId });
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      booking.bookingStatus = "REJECTED";
      booking.rejectionReason = reason.trim();

      /* ===== OPTIONAL REFUND HANDLING ===== */
      if (refundMode && refundValue) {
        booking.refundMode = refundMode;
        booking.refundValue = refundValue;
        booking.paymentStatus = "REFUNDED";

        if (req.file) {
          booking.refundProofPath = req.file.filename;
        }
      } else {
        booking.paymentStatus = "PAID"; // rejected but not refunded yet
      }

      await booking.save();

      await sendBrevoEmail({
  to: booking.email,
  subject: "Booking Rejected – Hotel Nupur Palace",
  text: `
Dear ${booking.name},

Your booking has been REJECTED.

Booking ID: ${booking.bookingId}

Reason:
${booking.rejectionReason}

Refund Status: ${booking.paymentStatus}
Refund Mode: ${booking.refundMode || "Not processed"}
Refund To: ${booking.refundValue || "Not processed"}

Hotel Nupur Palace
`,
  attachmentPath: booking.refundProofPath
    ? path.join(__dirname, "..", "uploads", booking.refundProofPath)
    : null
});



      res.json({ success: true });

    } catch (err) {
      console.error("Reject booking error:", err);
      res.status(500).json({ error: "Rejection failed" });
    }
  }
);


module.exports = router;