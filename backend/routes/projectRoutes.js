// // routes/projectRoutes.js
// import express from "express";
// import { createProject, getAllProjects } from "../controllers/projectController.js";
// import { protect } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// router.route("/")
//   .post(protect, createProject)
//   .get(protect, getAllProjects);

// export default router;

import express from "express";
import {
  createProject,
  getAllProjects,
  getAvailableProjects, // ✅ ADD
  selectProject, // ✅ ADD
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.route("/")
  .post(protect, createProject)
  .get(protect, getAllProjects);
  
// Student routes
router.get("/available", protect, getAvailableProjects); // ✅ ADD
router.put("/:id/select", protect, selectProject); // ✅ ADD

export default router;