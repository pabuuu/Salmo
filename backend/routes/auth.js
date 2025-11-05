import express from "express";
import { login, customerLogin, checkCustomerPassword, createPass } from "../controllers/authController.js";

const router = express.Router();

// admin login
router.post("/login", login);
//tenants   
router.post("/customer-login", customerLogin);
router.post("/check-password",checkCustomerPassword);
router.post("/set-password",createPass);
export default router;
