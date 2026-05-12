const geoip = require("geoip-lite");
const Visitor = require("../models/Visitor");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const UAParser = require("ua-parser-js");
const Surah = require("../models/Surah"); // Add this near your other requires

// Make sure to put this in your .env file in production!
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-quran-admin-key";

// --- SECURITY MIDDLEWARE ---
// This checks if the user has a valid cookie before letting them see the dashboard
const requireAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    console.warn("RequireAdmin: missing admin_token cookie");
    return res.status(401).render("admin-login", {
      title: "Admin Login",
      error:
        "Access denied. Admin token is missing. Please log in to continue.",
    });
  }

  try {
    // Verify the token hasn't been tampered with
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id; // Store admin ID in request for later use if needed
    next(); // Pass checks! Let them through to the dashboard.
  } catch (err) {
    console.error("RequireAdmin: Invalid or expired admin_token");
    res.status(401).render("admin-login", {
      title: "Admin Login",
      error:
        "Access denied. Admin token is invalid or expired. Please log in again.",
    });
  }
};

const trackVisitor = async (req, res) => {
  try {
    const { visitorId, timeSpentToAdd, surahId } = req.body; // Add surahId here
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : "Unknown";

    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();
    const browser = ua.browser.name
      ? `${ua.browser.name} ${ua.browser.version || ""}`
      : "Unknown";
    const os = ua.os.name ? `${ua.os.name} ${ua.os.version || ""}` : "Unknown";
    let device = "Desktop";
    if (ua.device.vendor && ua.device.model) {
      device = `${ua.device.vendor} ${ua.device.model}`;
    } else if (ua.device.type === "mobile" || ua.device.type === "tablet") {
      device = ua.device.type.charAt(0).toUpperCase() + ua.device.type.slice(1);
    }

    let visitor = await Visitor.findOne({ visitorId });
    if (!visitor) {
      visitor = new Visitor({ visitorId, ip, country, browser, os, device });
      // NEW: Log the first Surah view
      if (surahId)
        visitor.readHistory.push({
          surahNumber: surahId,
          timeSpent: timeSpentToAdd || 0,
        });
    } else {
      visitor.totalTimeSpent += timeSpentToAdd || 0;
      visitor.lastActive = Date.now();
      if (geo && visitor.country === "Unknown") visitor.country = geo.country;
      visitor.ip = ip;
      visitor.browser = browser;
      visitor.os = os;
      visitor.device = device;

      // NEW: Update time spent on this specific Surah
      if (surahId) {
        const historyIndex = visitor.readHistory.findIndex(
          (h) => h.surahNumber === surahId,
        );
        if (historyIndex > -1) {
          visitor.readHistory[historyIndex].timeSpent += timeSpentToAdd || 0;
        } else {
          visitor.readHistory.push({
            surahNumber: surahId,
            timeSpent: timeSpentToAdd || 0,
          });
        }
      }
    }

    await visitor.save();
    res.sendStatus(200);
  } catch (err) {
    console.error("Tracking Error:", err);
    res.sendStatus(500);
  }
};

const adminDashboard = async (req, res) => {
  try {
    // Total unique visitors
    const totalVisitors = await Visitor.countDocuments();

    // Group visitors by country
    const countryStats = await Visitor.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, // Sort highest to lowest
    ]);

    // Calculate average time spent across all visitors
    const timeStats = await Visitor.aggregate([
      { $group: { _id: null, avgTime: { $avg: "$totalTimeSpent" } } },
    ]);

    // 1. Dig into the readHistory arrays, group by Surah, and sum up the time
    const topSurahsData = await Visitor.aggregate([
      { $unwind: "$readHistory" },
      {
        $group: {
          _id: "$readHistory.surahNumber",
          totalTime: { $sum: "$readHistory.timeSpent" },
          uniqueReaders: { $sum: 1 }, // How many different people read it
        },
      },
      { $sort: { totalTime: -1 } }, // Sort by highest time
      { $limit: 5 }, // Top 5
    ]);

    // 2. Lookup the actual Surah names from the database
    const topSurahs = await Promise.all(
      topSurahsData.map(async (stat) => {
        const surahDoc = await Surah.findOne({ surahNumber: stat._id }).lean();
        const m = Math.floor(stat.totalTime / 60);
        const s = stat.totalTime % 60;
        return {
          surahNumber: stat._id,
          name: surahDoc
            ? surahDoc.surahName || surahDoc.surahNameEnglish
            : `Surah ${stat._id}`,
          totalTimeFormatted: `${m}m ${s}s`,
          uniqueReaders: stat.uniqueReaders,
        };
      }),
    );

    // Format the average time nicely (Minutes and Seconds)
    const avgTimeSeconds =
      timeStats.length > 0 ? Math.round(timeStats[0].avgTime) : 0;
    const avgMinutes = Math.floor(avgTimeSeconds / 60);
    const avgSeconds = avgTimeSeconds % 60;
    const avgTimeString = `${avgMinutes}m ${avgSeconds}s`;

    // --- NEW: Fetch Individual Visitor Logs ---
    // Get the 100 most recently active visitors
    const rawVisitors = await Visitor.find()
      .sort({ lastActive: -1 })
      .limit(100);

    // Map them into a nicely formatted array for the frontend
    const visitorLogs = rawVisitors.map((v) => {
      const m = Math.floor(v.totalTimeSpent / 60);
      const s = v.totalTimeSpent % 60;
      return {
        id: v.visitorId,
        country: v.country === "Unknown" ? "🌐 Unknown/Local" : v.country,
        timeSpent: `${m}m ${s}s`,
        lastActive: new Date(v.lastActive).toLocaleString(),
        // --- PASS NEW FIELDS TO FRONTEND ---
        ip: v.ip || "Unknown",
        browser: v.browser || "Unknown",
        os: v.os || "Unknown",
        device: v.device || "Desktop",
      };
    });

    // Render the view, now including visitorLogs
    res.render("dashboard", {
      title: "Admin Dashboard - Analytics",
      totalVisitors,
      countryStats,
      avgTimeString,
      visitorLogs, // <-- Pass the new data to the view
      topSurahs, // <-- Pass the top Surah data to the view
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error loading Dashboard");
  }
};

const adminLoginPage = (req, res) => {
  // If they are already logged in, redirect straight to dashboard
  if (req.cookies.admin_token) return res.redirect("/admin/dashboard");
  res.render("admin-login", {
    title: "Admin Login",
    error:
      "Please log in to access the admin dashboard. Admin credentials are required.",
  });
};

const handleAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.render("admin-login", {
        title: "Admin Login",
        error: "Invalid credentials",
      });
    }

    // Check if passwords match using bcrypt
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render("admin-login", {
        title: "Admin Login",
        error: "Invalid credentials",
      });
    }

    // Generate the JWT Token (valid for 24 hours)
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "24h" });

    // Set the secure HttpOnly cookie
    res.cookie("admin_token", token, {
      httpOnly: true, // Javascript cannot read this (Protects against XSS)
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const handleAdminLogout = (req, res) => {
  res.clearCookie("admin_token");
  res.redirect("/admin/login");
};

module.exports = {
  trackVisitor,
  adminDashboard,
  adminLoginPage,
  handleAdminLogin,
  handleAdminLogout,
  requireAdmin, // <-- Export the middleware so it can be used in routes
  JWT_SECRET, // <-- Export the secret for use in other parts of the app if needed
};
