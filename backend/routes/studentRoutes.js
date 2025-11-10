// import express from "express";
// import {
//   addStudent,
//   getStudents,
//   getStudentById,
//   updateStudent,
//   deleteStudent,
// } from "../controllers/student/studentController.js";

// const router = express.Router();

// router.post("/", addStudent);
// router.get("/", getStudents);
// router.get("/:id", getStudentById);
// router.put("/:id", updateStudent);
// router.delete("/:id", deleteStudent);

// export default router;

// import express from "express";
// import {
//   addStudent,
//   getStudents,
//   getStudentById,
//   updateStudent,
//   deleteStudent,
// } from "../controllers/student/studentController.js";
// import { protect } from "../middlewares/authMiddleware.js"; // verify admin login

// const router = express.Router();

// // Admin: Add a new student
// router.post("/", protect, addStudent);

// // Admin: Get all students
// router.get("/", protect, getStudents);

// // Admin: Get single student by ID
// router.get("/:id", protect, getStudentById);

// // Admin: Update student
// router.put("/:id", protect, updateStudent);

// // Admin: Delete student
// router.delete("/:id", protect, deleteStudent);

// export default router;


import express from "express";
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  assignSupervisor,
  assignGroup,
} from "../controllers/student/studentController.js";
import { protect } from "../middlewares/authMiddleware.js"; // verify admin login

const router = express.Router();

// 🧑‍🎓 Add new student
router.post("/", protect, addStudent);

// 📋 Get all students
router.get("/", protect, getStudents);

// 🔍 Get a single student by ID
router.get("/:id", protect, getStudentById);

// ✏️ Update student details
router.put("/:id", protect, updateStudent);

// 🗑️ Delete a student
router.delete("/:id", protect, deleteStudent);

// 🧑‍🏫 Assign supervisor to a student
router.put("/:id/supervisor", protect, assignSupervisor);

// 👥 Assign group to a student
router.put("/:id/group", protect, assignGroup);

export default router;
