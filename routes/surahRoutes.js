const express = require("express");
const router = express.Router();
const surahController = require("../controllers/surahController");

// Render the homepage with the list of Surahs
router.get("/", surahController.getAllSurahs);

// Render a specific Surah with its Ayahs
router.get("/surah/:id", surahController.getSurahById);

// API endpoint for specific Ayahs (for your future expansion)
router.get(
  "/api/surah/:surahId/ayah/:ayahNumber",
  surahController.getAyahsBySurahId,
);

module.exports = router;
