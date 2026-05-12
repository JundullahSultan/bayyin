const Surah = require("../models/Surah");

// Render the Courses Page
const getCoursesPage = (req, res) => {
  res.render("courses", {
    title: "Courses - Al-Qur'an",
    activeTab: "courses",
  });
};

// Render the Quizzes Page
const getQuizzesPage = (req, res) => {
  res.render("quizzes", {
    title: "Quizzes - Al-Qur'an",
    activeTab: "quizzes",
  });
};

// Get all surahs for the Home page
const getAllSurahs = async (req, res) => {
  try {
    const dbSurahs = await Surah.find({})
      .select("surah meta -_id")
      .sort({ "meta.surahNumber": 1 })
      .lean();

    const surahs = dbSurahs.map((dbSurah) => ({
      surahNumber: dbSurah.meta ? dbSurah.meta.surahNumber : 0,
      surahName: dbSurah.surah || "Unknown",
      surahNameEnglish:
        dbSurah.meta && dbSurah.meta.surahNameEnglish
          ? dbSurah.meta.surahNameEnglish
          : dbSurah.surah === "Al-Infitar"
            ? "The Cleaving"
            : "Unknown",
    }));

    // --- NEW: Tell the browser to cache the home page for 24 hours ---
    res.set("Cache-Control", "public, max-age=86400");

    res.render("home", {
      surahs,
      title: "Home - Al-Qur'an",
      activeTab: "surahs",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Get a specific surah with all its ayahs (Paginated)
const getSurahById = async (req, res) => {
  try {
    const dbSurah = await Surah.findOne({
      "meta.surahNumber": Number(req.params.id),
    }).lean();

    if (!dbSurah) {
      return res.status(404).send("Surah not found");
    }

    // 1. Map the ayahs object into an array
    const ayahsArray = Object.keys(dbSurah.ayahs || {}).map((key) => {
      const ayahData = dbSurah.ayahs[key];
      return {
        ayahNumber: parseInt(key),
        arabicText: ayahData.arabicAyah,
        translation: ayahData.translation,
        explanation: ayahData.explanation,
      };
    });

    // 2. Sort the ayahs to guarantee numerical order
    ayahsArray.sort((a, b) => a.ayahNumber - b.ayahNumber);

    // 3. Pagination Logic (20 Ayahs per page)
    const limit = 20;
    const currentPage = parseInt(req.query.page) || 1;
    const totalPages = Math.ceil(ayahsArray.length / limit);

    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    const paginatedAyahs = ayahsArray.slice(startIndex, endIndex);

    // 4. Format the final Surah object
    const formattedSurah = {
      surahName: dbSurah.surah,
      surahNameEnglish: dbSurah.meta.surahNameEnglish,
      surahNumber: dbSurah.meta.surahNumber,
      revelationType: dbSurah.meta.revelationType,
      juz: dbSurah.meta.juz,
      totalAyahs: ayahsArray.length,
      ayahs: paginatedAyahs, // Only passing the 20 sliced Ayahs
    };

    // --- NEW: Tell the browser to cache this specific page for 24 hours ---
    res.set("Cache-Control", "public, max-age=86400");

    res.render("ayahs", {
      surah: formattedSurah,
      title: `${formattedSurah.surahName} - Page ${currentPage}`,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Get specific ayah (API for future expansion)
const getAyahsBySurahId = async (req, res) => {
  try {
    const surahId = Number(req.params.surahId);
    const ayahNumber = String(req.params.ayahNumber);

    const surah = await Surah.findOne({ "meta.surahNumber": surahId }).lean();

    if (!surah) {
      return res.status(404).send("Surah not found");
    }

    const ayah = surah.ayahs ? surah.ayahs[ayahNumber] : null;

    if (!ayah) {
      return res.status(404).send("Ayah not found");
    }

    res.set("Cache-Control", "public, max-age=86400"); // Cache the API too!
    res.json({
      surah: surah.surah,
      ayahNumber: Number(ayahNumber),
      arabicText: ayah.arabicAyah || ayah.arabicText,
      translation: ayah.translation,
      explanation: ayah.explanation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

async function downloadSurahPDF(req, res) {
  // Keeping this as a placeholder for your backend PDF logic if needed later
}

module.exports = {
  getCoursesPage,
  getQuizzesPage,
  getAllSurahs,
  getSurahById,
  getAyahsBySurahId,
  downloadSurahPDF,
};
