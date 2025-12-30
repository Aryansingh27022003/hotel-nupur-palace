// // require("dotenv").config();
// // const express = require("express");
// // const multer = require("multer");
// // const PDFDocument = require("pdfkit");
// // const fs = require("fs");
// // const path = require("path");
// // const Booking = require("../models/Booking");
// // const sendEmail = require("../utils/sendEmail");
// // const sendOwnerEmail = require("../utils/sendOwnerEmail");




// // const router = express.Router();

// // /* ================= MULTER ================= */
// // const upload = multer({
// //   dest: path.join(__dirname, "..", "uploads")
// // });


// // /* ================= BOOKING ID ================= */
// // function generateBookingId() {
// //   const year = new Date().getFullYear();
// //   const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
// //   return `NUPUR-${year}-${rand}`;
// // }

// // /* ======================================================
// //    STEP 1️⃣ CREATE PENDING BOOKING (BEFORE PAYMENT)
// //    ====================================================== */
// // router.post(
// //   "/create-pending",
// //   upload.any(),
// //   async (req, res) => {
// //     try {
// //       const bookingId = generateBookingId();
// //       const body = req.body;
// //       const files = req.files || [];

// //       /* ---------- PRIMARY ID ---------- */
// //       const bookerFile = files.find(f => f.fieldname === "bookerId");
// //       if (!bookerFile) {
// //         return res.status(400).json({ error: "Primary ID proof required" });
// //       }

// //       /* ---------- GUESTS ---------- */
// //       const guestCount = parseInt(body.guests || "0", 10);
// //       const guests = [];

// //       for (let i = 1; i <= guestCount; i++) {
// //         const guestIdFile = files.find(f => f.fieldname === `guest_id_${i}`);

// //         guests.push({
// //           name: body[`guest_name_${i}`],
// //           age: body[`guest_age_${i}`],
// //           relation: body[`guest_relation_${i}`],
// //           idProofPath: guestIdFile ? guestIdFile.filename : null
// //         });
// //       }

// //       /* ---------- SAVE BOOKING ---------- */
// //       const booking = new Booking({
// //         bookingId,
// //         name: body.name,
// //         phone: body.phone,
// //         whatsapp: body.whatsapp,
// //         email: body.email,

// //         roomType: body.roomType,
// //         checkIn: body.checkIn,
// //         checkOut: body.checkOut,

// //         amount: body.amount,

// //         idProofPath: bookerFile.filename,
// //         guests,

// //         paymentStatus: "NOT_PAID",
// //         bookingStatus: "PENDING_APPROVAL"
// //       });

// //       await booking.save();

// //       /* ---------- SEND RECEIPT EMAIL ---------- */
// //       if (booking.email) {
// //         await sendEmail(
// //           booking.email,
// //           booking.bookingId,
// //           null,                     // no confirmation PDF
// //           "RECEIPT"                 // 🔥 tell mailer this is receipt
// //         );
// //       }

// //       /* ---------- OWNER NOTIFY ---------- */
// //       await sendOwnerEmail(booking);

// //       res.json({
// //         success: true,
// //         bookingId,
// //         amount: booking.amount
// //       });

// //     } catch (err) {
// //       console.error("Create booking error:", err);
// //       res.status(500).json({ error: "Failed to create booking" });
// //     }
// //   }
// // );


// // /* ======================================================
// //    STEP 2️⃣ STORE RAZORPAY ORDER ID
// //    ====================================================== */
// // // router.post("/store-order-id", async (req, res) => {
// // //   try {
// // //     const { bookingId, razorpayOrderId } = req.body;

// // //     await Booking.findOneAndUpdate(
// // //       { bookingId },
// // //       { razorpayOrderId }
// // //     );

// // //     res.json({ success: true });
// // //   } catch (err) {
// // //     console.error("Store order id error:", err);
// // //     res.status(500).json({ error: "Failed to store order id" });
// // //   }
// // // });

// // // /* ======================================================
// // //    STEP 3️⃣ RAZORPAY SUCCESS CALLBACK
// // //    ====================================================== */
// // // router.post("/razorpay-success", async (req, res) => {
// // //   console.log("🔥 Razorpay success hit");
// // //   console.log("BODY:", req.body);

// // //   try {
// // //     const {
// // //       razorpay_payment_id,
// // //       razorpay_order_id
// // //     } = req.body;

// // //     const booking = await Booking.findOneAndUpdate(
// // //       { razorpayOrderId: razorpay_order_id },   // ✅ CORRECT MATCH
// // //       {
// // //         paymentStatus: "PAID",
// // //         paymentId: razorpay_payment_id
// // //       },
// // //       { new: true }
// // //     );

// // //     if (!booking) {
// // //       return res.redirect("http://localhost:5000/");
// // //     }


// // /* ================= PREMIUM BOOKING PDF ================= */

// // const pdfDir = path.join(__dirname, "..", "confirmations");
// // if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

// // const pdfPath = path.join(pdfDir, `${booking.bookingId}.pdf`);
// // const doc = new PDFDocument({ size: "A4", margin: 55 });

// // doc.pipe(fs.createWriteStream(pdfPath));

// // /* ---------- PAGE BORDER (ALL 4 SIDES) ---------- */
// // doc.rect(30, 30, 535, 782).stroke("#cccccc");

// // /* ---------- SAFE WATERMARK ---------- */
// // doc.save();
// // doc.rotate(-30, { origin: [300, 420] });
// // doc.fontSize(42)
// //    .fillColor("#f0f0f0")
// //    .text(
// //      "HOTEL NUPUR PALACE",
// //      120,
// //      380,
// //      { align: "center", lineBreak: false }
// //    );
// // doc.restore();

// // /* ======================================================
// //    HEADER — FIXED POSITION (🔥 THIS IS THE FIX)
// //    ====================================================== */

// // // Always reset color
// // doc.fillColor("black");

// // // Main heading
// // doc.font("Helvetica-Bold")
// //    .fontSize(22)
// //    .text(
// //      "Hotel Nupur Palace",
// //      0,
// //      85,                // 🔥 ABSOLUTE Y POSITION
// //      { align: "center" }
// //    );

// // // Sub heading
// // doc.font("Helvetica")
// //    .fontSize(10)
// //    .fillColor("gray")
// //    .text(
// //      "Official Booking Confirmation",
// //      0,
// //      115,
// //      { align: "center" }
// //    );

// // // Separator line
// // doc.moveTo(55, 140).lineTo(540, 140).stroke();

// // // 🔥 Reset cursor BELOW header
// // doc.y = 165;

// // /* ---------- BOOKING DETAILS ---------- */
// // doc.font("Helvetica-Bold")
// //    .fontSize(15)
// //    .fillColor("black")
// //    .text("Booking Details", 85);   // 🔥 SAME X AS TABLE


// // doc.moveDown(1);

// // /* ---------- TABLE CONFIG ---------- */
// // const labelX = 85;
// // const valueX = 270;
// // const rowHeight = 26;

// // const tableTopY = doc.y;
// // let y = tableTopY;

// // const drawRow = (label, value) => {
// //   doc.font("Helvetica")
// //      .fontSize(11)
// //      .fillColor("#444")
// //      .text(label, labelX, y);

// //   doc.font("Helvetica-Bold")
// //      .fontSize(11)
// //      .fillColor("black")
// //      .text(value, valueX, y, { width: 250 });

// //   y += rowHeight;
// // };

// // /* ---------- TABLE ROWS ---------- */
// // drawRow("Booking ID", booking.bookingId);
// // drawRow("Guest Name", booking.name);
// // drawRow("Mobile Number", booking.phone);
// // drawRow("Email Address", booking.email || "—");
// // drawRow("Room Type", booking.roomType);
// // drawRow("Check-in Date", booking.checkIn);
// // drawRow("Check-out Date", booking.checkOut);
// // drawRow("Amount Paid", `Rs. ${booking.amount}`);
// // drawRow("Payment Status", "PAID");

// // /* ---------- TABLE BORDER ---------- */
// // doc.rect(
// //   70,
// //   tableTopY - 15,
// //   420,
// //   rowHeight * 8 + 30
// // ).stroke();

// // /* ---------- SPACE BEFORE INSTRUCTIONS ---------- */
// // doc.moveDown(3);

// // /* ---------- IMPORTANT INSTRUCTIONS ---------- */
// // const noteTopY = doc.y;

// // doc.font("Helvetica-Bold")
// //    .fontSize(13)
// //    .fillColor("red")
// //    .text("Important Check-in Instructions", 85, noteTopY);

// // doc.moveDown(1);

// // doc.font("Helvetica")
// //    .fontSize(11)
// //    .fillColor("black")
// //    .text(
// //      "• Please carry ORIGINAL government-issued ID proof for all guests.\n\n" +
// //      "• Check-in Time: 12:00 PM | Check-out Time: 11:00 AM.\n\n" +
// //      "• This confirmation must be shown at reception.",
// //      85,
// //      doc.y,
// //      { width: 360 }
// //    );

// // /* ---------- INSTRUCTION BOX ---------- */
// // doc.rect(
// //   70,
// //   noteTopY - 15,
// //   420,
// //   135
// // ).stroke();

// // /* ---------- SPACE BEFORE CONTACT ---------- */
// // doc.moveDown(3);

// // /* ---------- CONTACT INFO ---------- */
// // doc.font("Helvetica-Bold")
// //    .fontSize(12)
// //    .fillColor("black")
// //    .text("Contact Us", 85);

// // doc.moveDown(0.6);

// // doc.font("Helvetica")
// //    .fontSize(11)
// //    .fillColor("black")
// //    .text(
// //      "Phone: 7631062677 / 8051431138\n\n" +
// //      "Email: uttamnupur@gmail.com",
// //      85
// //    );

// // /* ---------- FOOTER ---------- */
// // doc.moveDown(3);

// // doc.fontSize(9.5)
// //    .fillColor("gray")
// //    .text(
// //      "This is a system-generated document. No signature required.\nHotel Nupur Palace",
// //      { align: "center" }
// //    );

// // doc.end();





// //     /* ================= EMAIL ================= */
// //     if (booking.email) {
// //         try {
// //             console.log("📧 Sending email to:", booking.email);
// //             await sendEmail(booking.email, booking.bookingId, pdfPath);
// //             console.log("✅ Email sent successfully");
// //         } catch (err) {
// //             console.error("❌ Email sending failed:", err);
// //         }
// //     }
// //     /* ================= OWNER NOTIFICATION ================= */
// //     try {
// //         await sendOwnerEmail(booking);          // 📧 Owner email
// //      // 📲 Owner WhatsApp
        
// //     } catch (err) {
// //         console.error("❌ Owner notification failed:", err);
// //     }



// //     return res.redirect(
// //       `http://localhost:5000/confirmation.html?bookingId=${booking.bookingId}`
// //     );

// //   } 

// //   catch (err) {
// //     console.error("Razorpay success error:", err);
// //     return res.redirect("http://localhost:5000/");
// //   }
// // });

// // module.exports = router;


// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const Booking = require("../models/Booking");
// const sendEmail = require("../utils/sendEmail");
// const sendOwnerEmail = require("../utils/sendOwnerEmail");

// const router = express.Router();

// /* ================= MULTER ================= */
// const upload = multer({
//   dest: path.join(__dirname, "..", "uploads")
// });

// /* ================= BOOKING ID ================= */
// function generateBookingId() {
//   const year = new Date().getFullYear();
//   const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
//   return `NUPUR-${year}-${rand}`;
// }

// /* ======================================================
//    CREATE BOOKING (NO PAYMENT CONFIRMATION)
//    ====================================================== */
// router.post("/create-pending", upload.any(), async (req, res) => {
//   try {
//     const bookingId = generateBookingId();
//     const body = req.body;
//     const files = req.files || [];

//     /* ---------- PRIMARY ID ---------- */
//     const bookerFile = files.find(f => f.fieldname === "bookerId");
//     if (!bookerFile) {
//       return res.status(400).json({ error: "Primary ID proof required" });
//     }

//     /* ---------- GUESTS ---------- */
//     const guestCount = parseInt(body.guests || "0", 10);
//     const guests = [];

//     for (let i = 1; i <= guestCount; i++) {
//       const guestIdFile = files.find(f => f.fieldname === `guest_id_${i}`);

//       guests.push({
//         name: body[`guest_name_${i}`],
//         age: body[`guest_age_${i}`],
//         relation: body[`guest_relation_${i}`],
//         idProofPath: guestIdFile ? guestIdFile.filename : null
//       });
//     }

//     /* ---------- SAVE BOOKING ---------- */
//     const booking = new Booking({
//       bookingId,
//       name: body.name,
//       phone: body.phone,
//       whatsapp: body.whatsapp,
//       email: body.email,

//       roomType: body.roomType,
//       checkIn: body.checkIn,
//       checkOut: body.checkOut,

//       amount: body.amount,

//       idProofPath: bookerFile.filename,
//       guests,

//       bookingStatus: "PENDING_APPROVAL",
//       paymentStatus: "NOT_PAID"
//     });

//     await booking.save();

//     /* ---------- SEND RECEIPT EMAIL ---------- */
//     if (booking.email) {
//       await sendEmail(
//         booking.email,
//         booking.bookingId,
//         null,
//         "RECEIPT"   // 🔥 IMPORTANT
//       );
//     }

//     res.json({
//       success: true,
//       bookingId
//     });

//   } catch (err) {
//     console.error("Create booking error:", err);
//     res.status(500).json({ error: "Failed to create booking" });
//   }
// });


// module.exports = router;


require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const Booking = require("../models/Booking");
const sendOwnerEmail = require("../utils/sendOwnerEmail");
const sendEmail = require("../utils/sendEmail");



const router = express.Router();

/* ================= MULTER CONFIG ================= */
const upload = multer({
  dest: path.join(__dirname, "..", "uploads")
});

/* ================= BOOKING ID ================= */
function generateBookingId() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NUPUR-${year}-${rand}`;
}

/* ======================================================
   STEP 1️⃣ CREATE BOOKING (NO PAYMENT YET)
   ====================================================== */
router.post("/create-pending", upload.any(), async (req, res) => {
  try {
    const bookingId = generateBookingId();
    const body = req.body;
    const files = req.files || [];

    const bookerFile = files.find(f => f.fieldname === "bookerId");
    if (!bookerFile) {
      return res.status(400).json({ error: "Primary ID proof required" });
    }

    const guestCount = parseInt(body.guests || "0", 10);
    const guests = [];

    for (let i = 1; i <= guestCount; i++) {
      const guestIdFile = files.find(f => f.fieldname === `guest_id_${i}`);
      guests.push({
        name: body[`guest_name_${i}`],
        age: body[`guest_age_${i}`],
        relation: body[`guest_relation_${i}`],
        idProofPath: guestIdFile ? guestIdFile.filename : null
      });
    }

    const booking = new Booking({
      bookingId,
      name: body.name,
      age: body.age,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,

      roomType: body.roomType,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      fromPlace: body.fromPlace,
      purpose: body.purpose,

      amount: body.amount,
      refundMode: body.refundMode,
      refundValue: body.refundValue,

      idProofPath: bookerFile.filename,
      guests,

      bookingStatus: "PENDING_APPROVAL",
      paymentStatus: "NOT_PAID"
    });

    await booking.save();

    if (booking.email) {
      await sendEmail(
        booking.email,
        booking.bookingId,
        null,
        "RECEIPT"
      );
    }

    res.json({ success: true, bookingId });

  } catch (err) {
    console.error("❌ Create booking error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/* ======================================================
   STEP 2️⃣ UPLOAD PAYMENT PROOF + GENERATE RECEIPT
   ====================================================== */
router.post(
  "/upload-payment-proof/:bookingId",
  upload.single("paymentProof"),
  async (req, res) => {
    try {
      const booking = await Booking.findOne({ bookingId: req.params.bookingId });
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Payment proof required" });
      }

      booking.paymentProofPath = req.file.filename;
      booking.paymentStatus = "PAID";

      /* ===== GENERATE RECEIPT PDF ===== */
      const receiptDir = path.join(__dirname, "..", "receipts");
      if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir);

      const pdfPath = path.join(receiptDir, `${booking.bookingId}.pdf`);
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      doc.pipe(fs.createWriteStream(pdfPath)); // ✅ FIXED

      doc.rect(25, 25, 560, 792).stroke("#cccccc");

      doc.font("Helvetica-Bold")
        .fontSize(20)
        .text("Hotel Nupur Palace", { align: "center" });

      doc.moveDown(0.3);
      doc.fontSize(11)
        .fillColor("gray")
        .text("Booking Receipt (Pending Approval)", { align: "center" });

      doc.moveDown(1);
      doc.moveTo(60, doc.y).lineTo(540, doc.y).stroke();
      doc.moveDown(1);

      doc.fillColor("black").fontSize(12);
      doc.text(`Booking ID: ${booking.bookingId}`);
      doc.text(`Guest Name: ${booking.name}`);
      doc.text(`Phone: ${booking.phone}`);
      doc.text(`Email: ${booking.email || "-"}`);
      doc.text(`Room Type: ${booking.roomType}`);
      doc.text(`Check-in: ${booking.checkIn}`);
      doc.text(`Check-out: ${booking.checkOut}`);
      doc.text(`Amount Paid: Rs ${booking.amount}`);

      doc.moveDown(1);
      doc.font("Helvetica-Bold")
        .text("Status: PENDING ADMIN APPROVAL", { underline: true });

      doc.moveDown(1);
      doc.font("Helvetica")
        .fontSize(11)
        .text(
          "This receipt confirms payment and document submission.\n" +
          "Final booking confirmation will be sent after admin verification.\n\n" +
          "Please do NOT visit the hotel until confirmation is received."
        );

      doc.moveDown(2);
      doc.fontSize(9)
        .fillColor("gray")
        .text(
          "This is a system-generated receipt.\nHotel Nupur Palace",
          { align: "center" }
        );

      doc.end();

      booking.receiptPdfPath = pdfPath; // ✅ ABSOLUTE PATH
      await booking.save();

      await sendEmail(
        booking.email,
        booking.bookingId,
        pdfPath,          // ✅ FIXED
        "RECEIPT"
      );

      await sendOwnerEmail(booking);

      res.json({ success: true, bookingId: booking.bookingId });

    } catch (err) {
      console.error("❌ Payment proof error:", err);
      res.status(500).json({ error: "Failed to upload proof" });
    }
  }
);

module.exports = router;
