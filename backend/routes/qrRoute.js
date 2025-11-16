import express from "express";
import { getQrCodes } from "../controllers/qrController.js";

const router = express.Router();

router.get("/", getQrCodes);

export default router;
