const mongoose = require("mongoose");

// Sub-schema for the detailed explanation blocks
const explanationDetailSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["heading", "paragraph", "list"],
      required: true,
    },
    content: { type: String }, // Used for headings and paragraphs
    title: { type: String }, // Used for lists
    items: [{ type: String }], // Used for lists
  },
  { _id: false },
);

// Sub-schema for the whole explanation
const explanationSchema = new mongoose.Schema(
  {
    introduction: { type: String },
    summary: { type: String },
    themes: [{ type: String }],
    details: [explanationDetailSchema],
  },
  { _id: false },
);

const ayahSchema = new mongoose.Schema({
  ayahNumber: { type: Number, required: true },
  arabicText: { type: String, required: true },
  translation: { type: String, required: true },
  explanation: explanationSchema, // Uses the structured schema
});

const surahSchema = new mongoose.Schema(
  {
    surahNumber: { type: Number, required: true },
    surahName: { type: String, required: true },
    surahNameEnglish: { type: String, required: true },
    revelationType: { type: String, enum: ["Makki", "Madani"], required: true },
    juz: { type: Number, required: true },
    totalAyahs: { type: Number, required: true },
    ayahs: [ayahSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Surah", surahSchema);
