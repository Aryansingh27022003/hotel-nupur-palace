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

/* ================= TRUST PROXY (REQUIRED ON RENDER) ================= */
app.set("trust proxy", 1);

/* ================= CORS (GITHUB PAGES → RENDER) ================= */
app.use(cors({
  origin: "https://aryansingh27022003.github.io",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔴 REQUIRED FOR PREFLIGHT REQUESTS
app.options("*", cors());

/* ================= BODY PARSERS ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= SESSION ================= */
app.use(session({
  name: "admin.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only (Render)
    sameSite: "none"   // Required for cross-site cookies
  }
}));

/* ================= STATIC FILES (ONLY BACKEND FILES) ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/receipts", express.static(path.join(__dirname, "receipts")));
app.use("/confirmations", express.static(path.join(__dirname, "confirmations")));

/* ================= API ROUTES ================= */
app.use("/api/booking", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

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
