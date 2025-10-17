import express from "express";
import Maintenance from "../models/Maintenance.js";
import {
  getMaintenances,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceById
} from "../controllers/maintenanceController.js";

const router = express.Router();

// Get all "In Process" maintenances with populated Unit + Tenant
router.get("/in-process", async (req, res) => {
  try {
    const maintenance = await Maintenance.find({ status: "In Process" })
      .populate("tenant", "name")
      .populate("unit", "unitNo name location"); // populate unit fields

    res.json({ success: true, maintenance });
  } catch (err) {
    console.error("Error fetching in-process maintenances:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Other routes
router.get("/", getMaintenances);
router.post("/", createMaintenance);
router.get("/:id", getMaintenanceById); // Keep this AFTER /in-process
router.put("/:id", updateMaintenance);
router.delete("/:id", deleteMaintenance);

export default router;
