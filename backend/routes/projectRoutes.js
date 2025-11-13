import express from "express";
import {
  createProject,
  getAllProjects,
  getAvailableProjects, // ✅ ADD
  revokeProjectAssignment,
  submitFinalDocumentation,
  // selectProject, // ✅ ADD
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";
import documentationUpload  from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Admin routes
router.route("/")
  .post(protect, createProject)
  .get(protect, getAllProjects);
  
// Student routes
router.get("/available", protect, getAvailableProjects); // ✅ ADD
// router.put("/:id/select", protect, selectProject); // ✅ ADD
router.put("/:id/revoke", protect, revokeProjectAssignment);
router.put("/submit-documentation", protect, documentationUpload, submitFinalDocumentation);

export default router;