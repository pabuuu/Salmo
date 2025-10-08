import Tenants from '../models/Tenants.js';
import Units from '../models/Units.js';
import dayjs from "dayjs"

import { updateOverdueTenants } from '../utils/updateOverdues.js';
// ✅ Load all tenants with their unit details
export const load = async (req, res) => {
  try {
    const tenants = await Tenants.find()
      .populate("unitId", "unitNo location rentAmount status") // only include what frontend needs
      .exec();

    res.json({ success: true, data: tenants, message: "Tenants loading successful" });
  } catch (err) {
    console.error("Error loading tenants:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Create Tenant
export const createTenant = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      unitId,
      rentAmount,
      paymentFrequency,
    } = req.body;

    if (!rentAmount || rentAmount <= 0) {
      return res.status(400).json({ success: false, message: "Rent amount is required and must be positive" });
    }

    if (!paymentFrequency) {
      return res.status(400).json({ success: false, message: "Payment frequency is required" });
    }

    // ✅ Automatically compute next due date
    let nextDueDate = new Date();
    if (paymentFrequency === "Monthly") nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    else if (paymentFrequency === "Quarterly") nextDueDate.setMonth(nextDueDate.getMonth() + 3);
    else if (paymentFrequency === "Yearly") nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

    // ✅ Create tenant
    const tenant = new Tenants({
      firstName,
      lastName,
      email,
      contactNumber,
      unitId,
      rentAmount,
      paymentFrequency,
      nextDueDate,
      balance: rentAmount,
    });

    await tenant.save();

    if (unitId) {
      await Units.findByIdAndUpdate(
        unitId,
        { status: "Occupied", tenant: tenant._id },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: "Tenant created and unit updated successfully",
      tenant,
    });
  } catch (err) {
    console.error("Error creating tenant:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create tenant",
    });
  }
};

// ✅ Get single tenant
export const getTenant = async (req, res) => {
  try {
    const tenant = await Tenants.findById(req.params.id)
      .populate("unitId", "unitNo location rentAmount status");

    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    res.json({ success: true, data: tenant });
  } catch (err) {
    console.error("Error fetching tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update tenant
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tenant = await Tenants.findById(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // If tenant is moving to another unit
    if (updates.rentalUnit && updates.location) {
      // Free old unit
      if (tenant.unitId) {
        await Units.findOneAndUpdate(
          { _id: tenant.unitId, tenant: tenant._id },
          { status: "Available", tenant: null }
        );
      }
      // Find and validate new unit
      const newUnit = await Units.findOne({
        unitNo: updates.rentalUnit,
        location: updates.location,
      });

      if (!newUnit) {
        return res.status(400).json({ success: false, message: "New unit not found" });
      }
      if (newUnit.status !== "Available") {
        return res.status(400).json({ success: false, message: "New unit is not available" });
      }

      // Occupy new unit
      newUnit.status = "Occupied";
      newUnit.tenant = tenant._id;
      await newUnit.save();

      // Update tenant’s unit reference
      updates.unitId = newUnit._id;
    }

    // Apply updates
    const updatedTenant = await Tenants.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate("unitId", "unitNo location rentAmount status");

    res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: updatedTenant,
    });
  } catch (err) {
    console.error("Error updating tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete tenant
export const archiveTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenants.findById(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // Toggle archive status
    const newStatus = !tenant.isArchived;
    tenant.isArchived = newStatus;

    // ✅ Disable validation so it won’t require all fields again
    await tenant.save({ validateBeforeSave: false });

    // Free unit only if archiving
    if (newStatus && tenant.unitId) {
      await Units.findOneAndUpdate(
        { _id: tenant.unitId, tenant: tenant._id },
        { status: "Available", tenant: null }
      );
    }

    res.json({
      success: true,
      message: newStatus
        ? "Tenant archived successfully."
        : "Tenant unarchived successfully.",
      archived: newStatus,
    });
  } catch (err) {
    console.error("Error archiving tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenants.find().populate("unitId").lean();

    const today = new Date();

    await updateOverdueTenants();

    const updatedTenants = await Promise.all(
      tenants.map(async (t) => {
        let status = t.status;

        // Check for overdue: if nextDueDate passed and balance > 0
        if (t.balance > 0 && new Date(t.nextDueDate) < today) {
          status = "Overdue";

          // Update DB so the tenant's status is consistent
          await Tenants.findByIdAndUpdate(t._id, { status });
        }

        return { ...t, status };
      })
    );

    res.status(200).json({ success: true, data: updatedTenants, message: "Tenants loading successful" });
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};