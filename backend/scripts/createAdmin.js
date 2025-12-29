const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

mongoose.connect("mongodb://127.0.0.1:27017/nupur_palace");

(async () => {
  const hashed = await bcrypt.hash("nupur123", 10);

  await Admin.create({
    username: "admin",
    password: hashed
  });

  console.log("✅ Admin created with hashed password");
  process.exit();
})();
