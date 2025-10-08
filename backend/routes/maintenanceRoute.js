import express from "express";
import {
  getMaintenances,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceById, // ✅ add this
} from "../controllers/maintenanceController.js";

const router = express.Router();

// ✅ Add this route before others that use :id if possible
router.get("/:id", getMaintenanceById);

// Get all maintenances
router.get("/", getMaintenances);

// Create a new maintenance
router.post("/create", createMaintenance);

// Update maintenance by ID
router.put("/:id", updateMaintenance);

// Delete maintenance by ID
router.delete("/:id", deleteMaintenance);

export default router;
