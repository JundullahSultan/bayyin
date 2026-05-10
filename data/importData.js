const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Surah = require("../models/Surah");

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Complete data for Surah Al-Infitar (82)
const surahInfitar = {
  surahNumber: 82,
  surahName: "Al-Infitar",
  surahNameEnglish: "The Cleaving",
  revelationType: "Makki",
  juz: 30,
  totalAyahs: 19,
  ayahs: [
    {
      ayahNumber: 1,
      arabicText: "إِذَا السَّمَاءُ انْفَطَرَتْ",
      translation: "When the sky breaks apart",
      explanation:
        "Default explanation - will be replaced with detailed tafsir in view",
    },
    {
      ayahNumber: 2,
      arabicText: "وَإِذَا الْكَوَاكِبُ انْتَثَرَتْ",
      translation: "And when the stars fall, scattering",
      explanation:
        "EXPLANATION (Tafsir insights for this ayah to be added — reflecting on the cosmic disintegration)",
    },
    {
      ayahNumber: 3,
      arabicText: "وَإِذَا الْبِحَارُ فُجِّرَتْ",
      translation: "And when the seas are erupted",
      explanation:
        "EXPLANATION (Tafsir insights for this ayah to be added — the oceans bursting forth)",
    },
    {
      ayahNumber: 4,
      arabicText: "وَإِذَا الْقُبُورُ بُعْثِرَتْ",
      translation: "And when the [contents of] graves are scattered",
      explanation:
        "EXPLANATION (Tafsir insights for this ayah to be added — resurrection of the dead)",
    },
    {
      ayahNumber: 5,
      arabicText: "عَلِمَتْ نَفْسٌ مَا قَدَّمَتْ وَأَخَّرَتْ",
      translation:
        "A soul will [then] know what it has put forth and kept back.",
      explanation:
        "EXPLANATION (Tafsir insights: Every soul will witness its deeds, both先行 and delayed)",
    },
    {
      ayahNumber: 6,
      arabicText: "يَا أَيُّهَا الْإِنْسَانُ مَا غَرَّكَ بِرَبِّكَ الْكَرِيمِ",
      translation:
        "O mankind, what has deluded you concerning your Lord, the Generous,",
      explanation:
        "EXPLANATION (Tafsir insights: Reflecting on the immense generosity of Allah that humans often take for granted)",
    },
    {
      ayahNumber: 7,
      arabicText: "الَّذِي خَلَقَكَ فَسَوَّاكَ فَعَدَلَكَ",
      translation: "Who created you, proportioned you, and balanced you?",
      explanation:
        "EXPLANATION (Tafsir insights: Allah's perfect creation and fashioning of human beings)",
    },
    {
      ayahNumber: 8,
      arabicText: "فِي أَيِّ صُورَةٍ مَا شَاءَ رَكَّبَكَ",
      translation: "In whatever form He willed, He assembled you.",
      explanation:
        "EXPLANATION (Tafsir insights: The diversity of human forms is a sign of divine power)",
    },
    {
      ayahNumber: 9,
      arabicText: "كَلَّا بَلْ تُكَذِّبُونَ بِالدِّينِ",
      translation: "No! But you deny the Recompense.",
      explanation:
        "EXPLANATION (Tafsir insights: Denial of Judgment Day despite clear signs)",
    },
    {
      ayahNumber: 10,
      arabicText: "وَإِنَّ عَلَيْكُمْ لَحَافِظِينَ",
      translation: "And indeed, [appointed] over you are keepers,",
      explanation: "EXPLANATION (Tafsir insights: Angels recording every deed)",
    },
    {
      ayahNumber: 11,
      arabicText: "كِرَامًا كَاتِبِينَ",
      translation: "Noble and recording,",
      explanation:
        "EXPLANATION (Tafsir insights: Honorable scribes who never miss a thing)",
    },
    {
      ayahNumber: 12,
      arabicText: "يَعْلَمُونَ مَا تَفْعَلُونَ",
      translation: "They know whatever you do.",
      explanation:
        "EXPLANATION (Tafsir insights: Complete awareness of all actions)",
    },
    {
      ayahNumber: 13,
      arabicText: "إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ",
      translation: "Indeed, the righteous will be in pleasure,",
      explanation:
        "EXPLANATION (Tafsir insights: Eternal bliss for the righteous)",
    },
    {
      ayahNumber: 14,
      arabicText: "وَإِنَّ الْفُجَّارَ لَفِي جَحِيمٍ",
      translation: "And indeed, the wicked will be in Hellfire.",
      explanation:
        "EXPLANATION (Tafsir insights: Severe punishment for the wicked)",
    },
    {
      ayahNumber: 15,
      arabicText: "يَصْلَوْنَهَا يَوْمَ الدِّينِ",
      translation:
        "They will [enter to] burn therein on the Day of Recompense,",
      explanation:
        "EXPLANATION (Tafsir insights: They will experience the heat of Hell)",
    },
    {
      ayahNumber: 16,
      arabicText: "وَمَا هُمْ عَنْهَا بِغَائِبِينَ",
      translation: "And they will not be absent from it.",
      explanation:
        "EXPLANATION (Tafsir insights: No escape from divine punishment)",
    },
    {
      ayahNumber: 17,
      arabicText: "وَمَا أَدْرَاكَ مَا يَوْمُ الدِّينِ",
      translation: "And what can make you know what the Day of Recompense is?",
      explanation:
        "EXPLANATION (Tafsir insights: The magnitude of Judgment Day beyond human comprehension)",
    },
    {
      ayahNumber: 18,
      arabicText: "ثُمَّ مَا أَدْرَاكَ مَا يَوْمُ الدِّينِ",
      translation:
        "Then, what can make you know what the Day of Recompense is?",
      explanation:
        "EXPLANATION (Tafsir insights: Emphasis on the gravity and terror of that Day)",
    },
    {
      ayahNumber: 19,
      arabicText:
        "يَوْمَ لَا تَمْلِكُ نَفْسٌ لِنَفْسٍ شَيْئًا ۖ وَالْأَمْرُ يَوْمَئِذٍ لِلَّهِ",
      translation:
        "It is the Day when a soul will not possess for another soul [power to do] a thing; and the command, that Day, is [entirely] with Allah.",
      explanation:
        "EXPLANATION (Tafsir insights: Absolute sovereignty of Allah on Judgment Day — no intercession without His permission)",
    },
  ],
};

// Import function
const importData = async () => {
  try {
    // Clear existing data for surah 82 if exists
    await Surah.deleteOne({ surahNumber: 82 });

    // Insert the new surah
    await Surah.create(surahInfitar);

    console.log("✅ Surah Al-Infitar (82) imported successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
