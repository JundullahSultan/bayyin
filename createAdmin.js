const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

// Replace with your actual MongoDB connection string
const MONGO_URI = process.env.MONGODB_URI;

async function setupAdmin() {
  await mongoose.connect(MONGO_URI);

  const username = "admin";
  const plainTextPassword = "my_secure_password"; // CHANGE THIS!

  // Hash the password securely
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainTextPassword, salt);

  const newAdmin = new Admin({
    username: username,
    password: hashedPassword,
  });

  await newAdmin.save();
  console.log("✅ Admin user created successfully!");
  process.exit();
}

setupAdmin();
