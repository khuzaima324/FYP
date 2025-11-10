import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// --- ROUTES ---
import studentRoutes from "./routes/studentRoutes.js";
import studentAuthRoutes from "./routes/studentAuthRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import teacherAuthRoutes from "./routes/teacherAuthRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import pastProjectRoutes from "./routes/pastProjectRoutes.js";
import documentFormatRoutes from "./routes/documentFormatRoutes.js";
import studentDataRoutes from "./routes/studentDataRoutes.js"; 

// --- CONFIGURATION ---
// 1. dotenv.config() MUST be first
dotenv.config();

// 2. Connect to database
connectDB();

// 3. Setup __dirname for ES Modules (needed for static 'uploads' folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. Initialize Express App
const app = express();

// 5. Setup Middlewares
app.use(cors());
app.use(express.json()); // Only needs to be called once

// --- SETUP ROUTES ---

// 6. Base route
app.get("/", (req, res) => {
  res.send("FYP Management System Backend is running...");
});

// 7. API routes
// Note: Plural '/students' for managing, singular '/student' for auth
app.use("/api/students", studentRoutes);
app.use("/api/student", studentAuthRoutes); // For POST /api/student/login
app.use("/api/student", studentDataRoutes); // For student dashboard and profile

app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

// Note: Plural '/teachers' for managing, singular '/teacher' for auth
app.use("/api/teachers", teacherRoutes);
app.use("/api/teacher", teacherAuthRoutes); // For POST /api/teacher/login

app.use("/api/groups", groupRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/past-projects", pastProjectRoutes);
app.use("/api/document-formats", documentFormatRoutes);

// 8. Make 'uploads' folder static
// This serves files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));