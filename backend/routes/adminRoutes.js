import express from "express";
// ✅ 1. Import the new controller functions
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getDashboardStats,
} from "../controllers/admin/adminController.js";
import { protect } from "../middlewares/authMiddleware.js"; // verifies JWT

const router = express.Router();

// Get logged-in admin profile
router.get("/profile", protect, getAdminProfile);

// Update admin profile (name & email only)
router.put("/update-profile", protect, updateAdminProfile);

// ✅ 2. Add route for changing password
router.put("/change-password", protect, changeAdminPassword);

// ✅ 3. Add route for dashboard stats
router.get("/stats", protect, getDashboardStats);

export default router;