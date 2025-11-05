import express from "express";
import { resetPassword,requestPasswordReset } from "../controllers/resetController.js";

const router = express.Router();

router.post("/request-reset", requestPasswordReset);

router.post("/reset-password", resetPassword);

export default router;