const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // This will be securely hashed
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
