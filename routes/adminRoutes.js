const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");
const geoip = require("geoip-lite");
const {
  trackVisitor,
  adminDashboard,
  adminLoginPage,
  handleAdminLogin,
  handleAdminLogout,
  requireAdmin,
  JWT_SECRET,
} = require("../controllers/adminController");

// 1. Show the Login Page
router.get("/admin/login", adminLoginPage);

router.post("/admin/login", handleAdminLogin);

// 3. Logout Route
router.get("/admin/logout", handleAdminLogout);
// The Admin Dashboard Route
router.get("/admin/dashboard", requireAdmin, adminDashboard);

// Silent API Endpoint to track visitors and time spent
router.post("/api/track-visitor", trackVisitor);

module.exports = router;
