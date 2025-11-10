import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  toggleTeacherStatus,
} from "../controllers/teacher/teacherController.js";

const router = express.Router();

router.post("/", addTeacher);
router.get("/", getTeachers);
router.get("/:id", getTeacherById);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);
router.put("/:id/status", protect, toggleTeacherStatus);

export default router;
