import express from "express";
import {
  login,
  customerLogin,
  checkCustomerPassword,
  createPass,
  checkTemporaryPassword,
  setNewPassword, // Admin/Staff set password
} from "../controllers/authController.js";

const router = express.Router();

// 🔹 Admin / Staff login
router.post("/login", login);

// 🔹 Tenants login
router.post("/customer-login", customerLogin);

// 🔹 Check if tenant password is correct
router.post("/check-password", checkCustomerPassword);

// 🔹 Set new password for Admin/Staff
router.post("/set-password-admin", setNewPassword);

// 🔹 Set new password for Tenants
router.post("/set-password", createPass);

// 🔹 Check if admin/staff is using a temporary password
router.post("/check-temp-password", checkTemporaryPassword);

export default router;
