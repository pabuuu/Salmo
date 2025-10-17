import Maintenance from "../models/Maintenance.js";
import Tenant from "../models/Tenants.js";
import Unit from "../models/Units.js";

// Get ALL maintenance records
export const getMaintenances = async (req, res) => {
  try {
    const maintenances = await Maintenance.find()
      .sort({ createdAt: -1 })
      .lean();

    const populatedMaintenances = await Promise.all(
      maintenances.map(async (m) => {
        let tenant = null;
        let unit = null;

        try {
          tenant = await Tenant.findById(m.tenant, "firstName lastName email").lean();
        } catch {
          console.warn(`Tenant not found for maintenance ${m._id}`);
        }

        try {
          unit = await Unit.findById(m.unit, "unitNo location").lean();
        } catch {
          console.warn(`Unit not found for maintenance ${m._id}`);
        }

        return {
          ...m,
          tenant: tenant || null,
          unit: unit || null,
        };
      })
    );

    res.json({ success: true, data: populatedMaintenances });
  } catch (err) {
    console.error("Error fetching maintenances:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create a maintenance record
export const createMaintenance = async (req, res) => {
  try {
    const { tenant, unit, task, description, schedule, status } = req.body;

    if (!unit || !task || !schedule) {
      return res.status(400).json({
        success: false,
        message: "Unit, task, and schedule are required",
      });
    }

    const maintenance = new Maintenance({
      tenant: tenant || null,
      unit,
      task,
      description: description || "",
      schedule,
      status,
    });

    await maintenance.save();

    res.status(201).json({ success: true, data: maintenance });
  } catch (err) {
    console.error("Error creating maintenance:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single maintenance by ID
export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate("unit")
      .populate("tenant");

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    res.json(maintenance);
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update maintenance record
export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Maintenance.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated)
      return res.status(404).json({ success: false, message: "Maintenance not found" });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating maintenance:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete maintenance
export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Maintenance.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Maintenance not found" });

    res.json({ success: true, message: "Maintenance deleted successfully" });
  } catch (err) {
    console.error("Error deleting maintenance:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all "In Process" maintenances
export const getInProcessMaintenances = async (req, res) => {
  try {
    const maintenances = await Maintenance.find({ status: "In Process" })
      .populate("tenant", "firstName lastName email")
      .populate("unit", "unitNo location")
      .sort({ createdAt: -1 });

    res.json({ success: true, maintenance: maintenances }); // CHANGED "data" → "maintenance"
  } catch (error) {
    console.error("Full error log (in-process route):", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching in-process maintenances.",
      error: error.message || error.toString(),
      stack: error.stack,
    });
  }
};
