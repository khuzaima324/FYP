import express from "express";
import {
  createPastProject,
  getAllPastProjects,
  updatePastProject,
  deletePastProject,
} from "../controllers/pastProjectController.js";
import { protect } from "../middlewares/authMiddleware.js";
// You may need an admin-specific middleware here if 'protect' doesn't check role
// import { admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route for all logged-in users
router.get("/", protect, getAllPastProjects);

// Admin-only routes
// If your 'protect' middleware doesn't check for 'admin' role,
// you'll need to add an 'admin' middleware or check in the controller.
router.post("/", protect, createPastProject); // Assuming protect is admin-only or controller checks
router.put("/:id", protect, updatePastProject);
router.delete("/:id", protect, deletePastProject);


export default router;