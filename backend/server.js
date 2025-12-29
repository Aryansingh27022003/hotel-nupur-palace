require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const bookingRoutes = require("./routes/booking");
const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- SESSION ---------------- */
app.use(session({
    secret: "hotel-nupur-secret",
    resave: false,
    saveUninitialized: false
}));

/* ---------------- STATIC FILES ---------------- */
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/receipts", express.static(path.join(__dirname, "receipts")));
app.use("/confirmations", express.static(path.join(__dirname, "confirmations")));
app.use("/admin", express.static(path.join(__dirname, "public/admin")));

/* ---------------- ROUTES ---------------- */
app.use("/api/booking", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

/* ---------------- DATABASE + SERVER ---------------- */
(async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/nupur_palace");
        console.log("MongoDB connected");

        app.listen(5000, () => {
            console.log("Server running on http://localhost:5000");
            console.log("Admin panel → http://localhost:5000/admin/login.html");
        });

    } catch (err) {
        console.error("❌ Startup failed:", err);
        process.exit(1);
    }
})();

/* ---------------- GLOBAL ERROR SAFETY ---------------- */
process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
});
