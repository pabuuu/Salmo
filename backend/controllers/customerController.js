import Tenants from "../models/Tenants.js";

// Fetch logged-in tenant profile
export const getMe = async (req, res) => {
  try {
    const tenant = await Tenants.findById(req.tenantId)
      .populate("unitId", "unitNo location rentAmount status");

    if (!tenant)
      return res.status(404).json({ success: false, message: "Tenant not found" });

    res.status(200).json({ success: true, data: tenant });
  } catch (err) {
    console.error("Error fetching tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update logged-in tenant profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const updatedTenant = await Tenants.findByIdAndUpdate(req.tenantId, updates, {
      new: true,
      runValidators: true,
    }).populate("unitId", "unitNo location rentAmount status");

    res.status(200).json({ success: true, data: updatedTenant });
  } catch (err) {
    console.error("Error updating tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
