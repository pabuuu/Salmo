import express from "express";
import multer from "multer";
import {
  createPayment,
  getTenantPayments,
  getAllPayments
} from "../controllers/paymentsController.js";
import { createPayMongoIntent } from "../controllers/paymongoController.js";

const paymentRoute = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔹 Existing route: create payment with receipt
paymentRoute.post("/create", upload.single("receipt"), createPayment);

// 🔹 Get tenant payments
paymentRoute.get("/:id/payments", getTenantPayments);  
paymentRoute.get("/tenant/:tenantId", getTenantPayments);  // e.g., /api/payments/tenant/123

// 🔹 Get all payments
paymentRoute.get("/all", getAllPayments);

// 🔹 New route: create PayMongo payment intent
paymentRoute.post("/paymongo/create-intent", createPayMongoIntent);

export default paymentRoute;
