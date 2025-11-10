import express from "express";
import { createGroup, getGroups } from "../controllers/admin/groupController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin can create and view groups
router.post("/", protect, createGroup);
router.get("/", protect, getGroups);

export default router;
