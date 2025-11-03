import express from "express";
import { login, customerLogin } from "../controllers/authController.js";

const router = express.Router();

// Admin login
router.post("/login", login);

// ✅ Customer login
router.post("/customer-login", customerLogin);

export default router;
