import express from "express";
import { uploadFormat, getFormats } from "../controllers/documentFormatController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js"; // Import our multer config

const router = express.Router();

// GET /api/document-formats (Public for all users)
router.get("/", protect, getFormats);

// POST /api/document-formats (Admin only - assuming 'protect' checks role)
router.post("/", protect, upload, uploadFormat);

export default router;