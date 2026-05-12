const express = require("express");
const router = express.Router();
const surahController = require("../controllers/surahController");

// Render the homepage with the list of Surahs
router.get("/", surahController.getAllSurahs);

// Render specific Surah
router.get("/surah/:id", surahController.getSurahById);

// Render the Courses & Quizzes Pages
router.get("/courses", surahController.getCoursesPage);
router.get("/quizzes", surahController.getQuizzesPage);

// API endpoint for specific Ayahs (for future expansion)
router.get(
  "/api/surah/:surahId/ayah/:ayahNumber",
  surahController.getAyahsBySurahId,
);

// PDF Download Route
router.get("/surah/:id/download-pdf", surahController.downloadSurahPDF);

module.exports = router;
