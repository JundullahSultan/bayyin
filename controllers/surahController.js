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
    const cacheKey = `surah_${req.params.id}`;

    // Always fetch from database first
    console.log("Fetching from database");
    const dbSurah = await Surah.findOne({
      "meta.surahNumber": Number(req.params.id),
    }).lean();

    if (!dbSurah) {
      return res.status(404).send("Surah not found");
    }

    const dbAyahsLength = Object.keys(dbSurah.ayahs).length;
    let cachedSurah = surahCache.get(cacheKey);
    const cachedAyahsLength = cachedSurah
      ? Object.keys(cachedSurah.ayahs).length
      : 0;

    if (cachedSurah && cachedAyahsLength === dbAyahsLength) {
      console.log("Serving from server-side cache");
      // Use cached data
    } else {
      console.log("Updating cache with database data");
      surahCache.set(cacheKey, dbSurah);
      cachedSurah = dbSurah;
    }

    // Now use cachedSurah (which is either from cache or updated from DB)
    const ayahsArray = Object.keys(cachedSurah.ayahs).map((key) => {
      const ayahData = cachedSurah.ayahs[key];
      return {
        ayahNumber: parseInt(key),
        arabicText: ayahData.arabicAyah, // Translating arabicAyah to arabicText
        translation: ayahData.translation,
        explanation: ayahData.explanation,
      };
    });

    // 3. Format the top-level Surah object to perfectly match the EJS variables
    const formattedSurah = {
      surahName: cachedSurah.surah,
      // Fallback for English name since it isn't in the JSON root
      surahNameEnglish:
        cachedSurah.surah === "Al-Infitar" ? "The Cleaving" : "",
      surahNumber: cachedSurah.meta.surahNumber,
      revelationType: cachedSurah.meta.revelationType,
      juz: cachedSurah.meta.juz,
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
