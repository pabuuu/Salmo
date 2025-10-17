import express from "express";
import multer from "multer";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expensesController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST with receipt
router.post("/", upload.single("receiptImage"), createExpense);

// PUT with receipt
router.put("/:id", upload.single("receiptImage"), updateExpense);

router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.delete("/:id", deleteExpense);

export default router;
