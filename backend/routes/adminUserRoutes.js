import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/admin/adminUserController.js";

const router = express.Router();

router.use(protect); // only logged-in admin can manage users

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
