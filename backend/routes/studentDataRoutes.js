import express from "express";
import {
  getStudentDashboardData,
  getStudentProfile,
  updateStudentProfile,
  changeStudentPassword,
} from "../controllers/student/studentDataController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// These routes will be mounted at /api/student

// For Student Dashboard
router.get("/dashboard-data", protect, getStudentDashboardData);

// For Student Profile Page
router.get("/profile", protect, getStudentProfile);
router.put("/update-profile", protect, updateStudentProfile);
router.put("/change-password", protect, changeStudentPassword);

export default router;