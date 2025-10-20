import Tenants from '../models/Tenants.js';
import Units from '../models/Units.js';
import Payments from "../models/PaymentsSchema.js";
import dayjs from "dayjs"
import { updateOverdueTenants } from '../utils/updateOverdues.js';
import { recalcTenantBalance } from './paymentsController.js';
import { getNextDueDate } from '../utils/dateUtils.js';

// Load all tenants with their unit details
export const load = async (req, res) => {
  try {
    const tenants = await Tenants.find()
      .populate("unitId", "unitNo location rentAmount status") // only include what frontend needs
      .exec();

    res.json({ success: true, data: tenants, message: "Tenants loading successful" });
  } catch (err) {
    console.error("Error loading tenants:", err)  ;
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create Tenant
export const createTenant = async (req, res) => {
  try {
    const { firstName, lastName, email, contactNumber, unitId, paymentFrequency, initialPayment = 0 } = req.body;

    // Validate required fields
    if (!firstName || !lastName) return res.status(400).json({ success: false, message: "First and last name required" });
    if (!unitId) return res.status(400).json({ success: false, message: "Unit must be selected" });
    if (!paymentFrequency) return res.status(400).json({ success: false, message: "Payment frequency is required" });

    const unit = await Units.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
    if (unit.status === "Occupied") return res.status(400).json({ success: false, message: "Unit already occupied" });

    const rentAmount = unit.rentAmount;
    if (!rentAmount || rentAmount <= 0) return res.status(400).json({ success: false, message: "Invalid rent amount" });
    if (initialPayment > rentAmount) return res.status(400).json({ success: false, message: "Initial payment exceeds rent" });

    // Initial status & balance
    let balance = Math.max(rentAmount - initialPayment, 0);
    let status = balance === 0 ? "Paid" : initialPayment > 0 ? "Partial" : "Pending";
    let nextDueDate = balance === 0 ? getNextDueDate(new Date(), paymentFrequency) : new Date(); // only advance if fully paid

    // Create tenant
    const tenant = await Tenants.create({
      firstName,
      lastName,
      email,
      contactNumber,
      unitId,
      paymentFrequency,
      initialPayment,
      balance,
      status,
      nextDueDate,
    });

    // Mark unit as occupied
    await Units.findByIdAndUpdate(unitId, { status: "Occupied", tenant: tenant._id });

    // Record initial payment if any
    if (initialPayment > 0) {
      await Payments.create({
        tenantId: tenant._id,
        unitId,
        amount: initialPayment,
        paymentDate: new Date(),
        paymentMethod: "Initial Payment",
        notes: "Recorded during tenant creation",
        status, // Partial or Paid
      });

      // Recalculate balance/status properly
      await recalcTenantBalance(tenant._id);
    }

    res.status(201).json({ success: true, message: "Tenant created successfully", tenant });
  } catch (err) {
    console.error("Error creating tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// Get single tenant
export const getTenant = async (req, res) => {
  try {
    const tenant = await Tenants.findById(req.params.id)
      .populate("unitId", "unitNo location rentAmount status");

    if (!tenant)
      return res.status(404).json({ success: false, message: "Tenant not found" });

    res.json({ success: true, data: tenant });
  } catch (err) {
    console.error("Error fetching tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Update tenant
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

// Delete tenant
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

    // Disable validation so it won’t require all fields again
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
    // Ensure balances and statuses are up-to-date
    const tenantsFromDb = await Tenants.find()
      .populate({
        path: "unitId",
        select: "unitNo rentAmount location status",
      })
      .lean();

    const today = new Date();

    const updatedTenants = tenantsFromDb.map((t) => {
      const balance = t.balance ?? t.unitId?.rentAmount ?? 0;
      let status = t.status || "Pending";

      if (balance === 0) {
        status = "Paid";
      } else if (balance > 0 && t.initialPayment > 0) {
        status = "Partial"; // Partially paid tenants stay Partial
      } else if (balance > 0 && t.initialPayment === 0 && new Date(t.nextDueDate) < today) {
        status = "Overdue"; // Only completely unpaid past due are Overdue
      } else if (balance > 0) {
        status = "Pending";
      }

      return {
        ...t,
        status,
        rentAmount: t.unitId?.rentAmount ?? 0,
      };
    });

    res.status(200).json({
      success: true,
      data: updatedTenants,
      message: "Tenants loaded successfully",
    });
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to load tenants",
    });
  }
};

// Delete tenant permanently
export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenants.findById(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // Free the unit if tenant has one
    if (tenant.unitId) {
      await Units.findByIdAndUpdate(tenant.unitId, {
        status: "Available",
        tenant: null,
      });
    }

    // Delete tenant record
    await Tenants.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Tenant deleted successfully" });
  } catch (err) {
    console.error("Error deleting tenant:", err);
    res.status(500).json({ success: false, message: "Failed to delete tenant" });
  }
};
