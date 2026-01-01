const express = require("express");
const Booking = require("../models/Booking");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/sendEmail");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

const router = express.Router();



/* ================= MULTER (REFUND PROOF) ================= */
const upload = multer({ storage: multer.memoryStorage() });



function uploadBufferToCloudinary(buffer, folder, filename, mimetype) {
  return new Promise((resolve, reject) => {
    const isPdf = mimetype === "application/pdf";

    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const format = isPdf ? "pdf" : filename.split(".").pop();

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isPdf ? "raw" : "image",
        public_id: nameWithoutExt,
        format: format,
        use_filename: true,
        unique_filename: false
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}



/* ================= GET BOOKINGS (WITH FILTERS) ================= */
router.get("/bookings", async (req, res) => {


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
   

    
    const doc = new PDFDocument({ size: "A4", margin: 55 });
    
    


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

const buffers = [];
doc.on("data", buffers.push.bind(buffers));

doc.on("end", async () => {
  const pdfBuffer = Buffer.concat(buffers);

  const confirmationUpload = await uploadBufferToCloudinary(
  pdfBuffer,
  "bookings/confirmations",
  `${booking.bookingId}.pdf`,   // ✅ ADD .pdf
  "application/pdf"
  );


  booking.confirmationPdfPath = confirmationUpload.secure_url;
  await booking.save();

  await sendEmail(
    booking.email,
    booking.bookingId,
    null,
    "CONFIRMATION"
  );

  res.json({ success: true });
});

doc.end();



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
      if (req.file) {
        const refundUpload = await uploadBufferToCloudinary(
        req.file.buffer,
        "bookings/refunds",
        `${booking.bookingId}-refund.${req.file.originalname.split(".").pop()}`,
        req.file.mimetype
        );


        booking.refundProofPath = refundUpload.secure_url;
        booking.paymentStatus = "REFUNDED";
        }
        else {
                booking.paymentStatus = "PAID";
         }


      await booking.save();
      let attachmentPath = null;



// sendEmail call
await sendEmail(
  booking.email,
  booking.bookingId,
  attachmentPath,  // can be null
  "REJECTED",
  booking.rejectionReason
);




      res.json({ success: true });

    } catch (err) {
      console.error("Reject booking error:", err);
      res.status(500).json({ error: "Rejection failed" });
    }
  }
);


module.exports = router;