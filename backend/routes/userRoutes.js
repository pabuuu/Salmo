import express from "express";
import { getUsers, getUsersByRole, registerUser } from "../controllers/userController.js";
import multer from "multer";

const router = express.Router();

// =========================
// Multer setup for file uploads (memory storage)
// =========================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =========================
// Routes
// =========================

// 🔹 Fetch all users
router.get("/", getUsers);

// 🔹 Fetch users by role (admin or staff)
router.get("/role/:role", getUsersByRole);

// 🔹 Register user (Admin/Staff) with optional validId + resume uploads
// `upload.fields([{name: "validId"}, {name: "resume"}])` handles both files
router.post(
  "/register",
  upload.fields([
    { name: "validId", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  registerUser
);

export default router;
