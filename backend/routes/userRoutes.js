import express from "express";
import multer from "multer";
import {
  getUsers,
  getUsersByRole,
  registerUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Fetch all users
router.get("/", getUsers);

// Fetch users by role (admin or staff)
router.get("/role/:role", getUsersByRole);

// Register new user (Admin/Staff) with optional validId + resume
router.post(
  "/register",
  upload.fields([
    { name: "validId", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  registerUser
);

// Forgot password — sends reset email
router.post("/forgot-password", forgotPassword);

// Reset password — updates password using token
router.post("/reset-password/:token", resetPassword);

export default router;
