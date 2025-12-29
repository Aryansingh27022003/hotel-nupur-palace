const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = function generatePdf(booking) {
    return new Promise((resolve) => {
        const pdfPath = path.join(
            __dirname,
            "..",
            "confirmations",
            `${booking.bookingId}.pdf`
        );

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // ===== HEADER =====
        doc.fontSize(20).text("Hotel Nupur Palace", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text("Booking Confirmation", { align: "center" });

        doc.moveDown(2);

        // ===== BOOKING DETAILS =====
        doc.fontSize(12).text(`Booking ID: ${booking.bookingId}`);
        doc.text(`Name: ${booking.name}`);
        doc.text(`Phone: ${booking.phone}`);
        doc.text(`Email: ${booking.email}`);
        doc.text(`Room Type: ${booking.roomType}`);
        doc.text(`Check-in: ${booking.checkIn}`);
        doc.text(`Check-out: ${booking.checkOut}`);
        doc.text(`Total Amount Paid: ₹${booking.amount}`);

        doc.moveDown(2);

        // ===== IMPORTANT ID NOTE (THIS IS WHAT YOU ASKED) =====
        doc
            .fontSize(11)
            .fillColor("red")
            .text("Important Check-in Note", { underline: true });

        doc.moveDown(0.5);

        doc
            .fontSize(10)
            .fillColor("black")
            .text(
                "Please carry the ORIGINAL government-issued ID proof for all guests, " +
                "including the primary booker, as provided during booking. " +
                "Hotel reserves the right to deny check-in if valid ID proof is not produced."
            );

        doc.moveDown(1);
        doc.text("Accepted ID Proofs: Aadhaar Card, Voter ID, Driving License, Passport.");

        // ===== FOOTER =====
        doc.moveDown(2);
        doc.fontSize(10).text("Hotel Nupur Palace, Garhwa, Jharkhand", {
            align: "center",
        });

        doc.end();

        stream.on("finish", () => resolve(pdfPath));
    });
};
