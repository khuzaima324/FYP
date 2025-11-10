// routes/projectRoutes.js
import express from "express";
import { createProject, getAllProjects } from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createProject)
  .get(protect, getAllProjects);

export default router;