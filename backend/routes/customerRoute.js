import express from "express";
import { getMe, updateProfile } from "../controllers/customerController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in tenant profile
router.get("/me", authMiddleware, getMe);

// Update logged-in tenant profile
router.put("/update", authMiddleware, updateProfile);

export default router;
