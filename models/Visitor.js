const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, unique: true },
    ip: { type: String },
    country: { type: String, default: "Unknown" },
    totalTimeSpent: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    device: { type: String, default: "Desktop/Unknown" },
    // --- NEW: Track time spent on specific Surahs ---
    readHistory: [
      {
        surahNumber: { type: Number },
        timeSpent: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Visitor", visitorSchema);
