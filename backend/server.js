require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const bookingRoutes = require("./routes/booking");
const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");

const app = express();

/* ================= TRUST PROXY (RENDER) ================= */
app.set("trust proxy", 1);

/* ================= CORS (FINAL FIX) ================= */
const allowedOrigins = [
  "https://aryansingh27022003.github.io"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* ================= BODY PARSERS ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= SESSION (ADMIN AUTH) ================= */
app.use(
  session({
    name: "admin.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,     // ✅ SECURITY
      secure: true,       // ✅ REQUIRED on Render
      sameSite: "none"    // ✅ REQUIRED for GitHub Pages
    }
  })
);

/* ================= ROUTES ================= */
app.use("/api/contact", contactRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/admin", adminRoutes);

const multer = require("multer");

/* ================= MULTER ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size must be less than 10 MB"
      });
    }
  }
  next(err);
});


/* ================= STATIC FILES ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/receipts", express.static(path.join(__dirname, "receipts")));
app.use("/confirmations", express.static(path.join(__dirname, "confirmations")));

/* ================= DATABASE + SERVER ================= */
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();

/* ================= GLOBAL ERROR SAFETY ================= */
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});
