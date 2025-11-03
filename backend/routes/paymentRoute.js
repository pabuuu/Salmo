import express from "express";
import multer from "multer";
import {
  createPayment,
  getTenantPayments,
  getAllPayments
} from "../controllers/paymentsController.js";
import {
  createPayMongoIntent,
  handlePayMongoWebhook
} from "../controllers/paymongoController.js";

const paymentRoute = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔹 Create payment with receipt
paymentRoute.post("/create", upload.single("receipt"), createPayment);

// 🔹 Get tenant payments
paymentRoute.get("/:id/payments", getTenantPayments);
paymentRoute.get("/tenant/:tenantId", getTenantPayments);

// 🔹 Get all payments
paymentRoute.get("/all", getAllPayments);

// 🔹 Create PayMongo payment intent
paymentRoute.post("/paymongo/create-intent", createPayMongoIntent);

// 🔹 PayMongo webhook listener
paymentRoute.post("/paymongo/webhook", express.raw({ type: "application/json" }), handlePayMongoWebhook);

export default paymentRoute;