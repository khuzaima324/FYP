import express from "express";
import { loginUser } from "../controllers/authController.js";

const router = express.Router();

// POST /api/student/login
router.post("/login", loginUser("student"));

export default router;
