const Surah = require("../models/Surah");

// Simple in-memory cache for server-side requests
const surahCache = new Map();

// Get all surahs for listing page
const getAllSurahs = async (req, res) => {
  try {
    const surahs = await Surah.find({});
    res.render("surahs", {
      surahs,
      title: "List of Surahs - Al-Qur'an",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Get a specific surah with all its ayahs
const getSurahById = async (req, res) => {
  try {
    // 1. Use .lean() to get the raw JSON data and bypass strict Mongoose schema casting
    // Note: We changed the query to look inside the "meta" object based on your JSON

    const cacheKey = `surah_${req.params.id}`;
    let dbSurah = surahCache.get(cacheKey);

    if (dbSurah) {
      console.log("Serving from server-side cache");
    } else {
      console.log("Fetching from database");
      dbSurah = await Surah.findOne({
        "meta.surahNumber": Number(req.params.id),
      }).lean();

      if (dbSurah) {
        surahCache.set(cacheKey, dbSurah);
      }
    }

    if (!dbSurah) {
      return res.status(404).send("Surah not found");
    }

    // 2. Transform the "ayahs" Object from the DB into an Array for the EJS forEach loop
    const ayahsArray = Object.keys(dbSurah.ayahs).map((key) => {
      const ayahData = dbSurah.ayahs[key];
      return {
        ayahNumber: parseInt(key),
        arabicText: ayahData.arabicAyah, // Translating arabicAyah to arabicText
        translation: ayahData.translation,
        explanation: ayahData.explanation,
      };
    });

    // 3. Format the top-level Surah object to perfectly match the EJS variables
    const formattedSurah = {
      surahName: dbSurah.surah,
      // Fallback for English name since it isn't in the JSON root
      surahNameEnglish: dbSurah.surah === "Al-Infitar" ? "The Cleaving" : "",
      surahNumber: dbSurah.meta.surahNumber,
      revelationType: dbSurah.meta.revelationType,
      juz: dbSurah.meta.juz,
      totalAyahs: ayahsArray.length, // Dynamically calculate total ayahs
      ayahs: ayahsArray,
    };

    // 4. Render the view with the newly formatted data
    res.render("ayahs", {
      surah: formattedSurah,
      title: `${formattedSurah.surahName} - Surah ${formattedSurah.surahNumber}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Get specific ayah (for future expansion)
const getAyahsBySurahId = async (req, res) => {
  try {
    const surah = await Surah.findOne({ surahNumber: req.params.surahId });

    if (!surah) {
      return res.status(404).send("Surah not found");
    }

    const ayah = surah.ayahs.find((a) => a.ayahNumber == req.params.ayahNumber);

    if (!ayah) {
      return res.status(404).send("Ayah not found");
    }

    res.json({
      surah: surah.surahName,
      ayahNumber: ayah.ayahNumber,
      arabicText: ayah.arabicText,
      translation: ayah.translation,
      explanation: ayah.explanation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getAllSurahs,
  getSurahById,
  getAyahsBySurahId,
};
