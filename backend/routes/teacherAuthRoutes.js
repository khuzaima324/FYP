import express from "express";
import { loginUser } from "../controllers/authController.js";

const router = express.Router();

// POST /api/teacher/login
router.post("/login", loginUser("teacher"));

export default router;