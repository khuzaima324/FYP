import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import PastProjectRoutes from "./routes/pastProjectRoutes.js";  

dotenv.config();
connectDB();


const app = express();

app.use(cors());
app.use(express.json());

// Base routes
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/past-projects", PastProjectRoutes);  // New route for past projects

app.get("/", (req, res) => {
  res.send("FYP Management System Backend is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
