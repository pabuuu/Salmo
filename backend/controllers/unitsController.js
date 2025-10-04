import Units from "../models/Units.js";
import Tenants from "../models/Tenants.js"; // <-- add this

// Load all units OR filter by location
export const load = async (req, res) => {
  try {
    const { location } = req.query;
    const query = location ? { location } : {};
    const units = await Units.find(query).populate("tenant"); // ✅ includes tenant info
    res.json({ success: true, data: units });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Load only available units for a specific location
export const getAvailableByLocation = async (req, res) => {
  try {
    const { location } = req.query; // ?location=MH Del Pilar
    if (!location) {
      return res.status(400).json({ success: false, message: "Location is required" });
    }

    const units = await Units.find({ location, status: "Available" });
    res.json({ success: true, data: units });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new unit
export const create = async (req, res) => {
  try {
    const { unitNo, rentAmount, status, location, notes } = req.body;

    // ✅ Check uniqueness of unitNo within the SAME location
    const existing = await Units.findOne({ unitNo, location });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Unit already exists in this location"
      });
    }

    const unit = new Units({ unitNo, rentAmount, status, location, notes });
    await unit.save();

    // ✅ Re-fetch with populated tenant (will be null at creation)
    const populatedUnit = await Units.findById(unit._id).populate("tenant");

    res.json({ success: true, message: "Unit created successfully", data: populatedUnit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a unit
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await Units.findByIdAndDelete(id);
    res.json({ success: true, message: "Unit deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a unit
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // ✅ Optional: if updating unitNo/location, re-check uniqueness
    if (updateData.unitNo || updateData.location) {
      const unit = await Units.findById(id);
      if (!unit) {
        return res.status(404).json({ success: false, message: "Unit not found" });
      }

      const newUnitNo = updateData.unitNo || unit.unitNo;
      const newLocation = updateData.location || unit.location;

      const duplicate = await Units.findOne({
        _id: { $ne: id },
        unitNo: newUnitNo,
        location: newLocation
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Another unit with this number already exists in this location"
        });
      }
    }

    // ✅ Update and populate tenant
    const updated = await Units.findByIdAndUpdate(id, updateData, { new: true })
      .populate("tenant");

    res.json({ success: true, message: "Unit updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single unit by ID
export const getOne = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ populate tenant so you get tenant details
    const unit = await Units.findById(id).populate("tenant");

    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    res.json({ success: true, data: unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Assign a tenant to a unit (reference ID, not string)
export const assignTenant = async (req, res) => {
  try {
    const { id } = req.params; // unitId
    const { tenantId } = req.body; // we expect tenantId only

    const unit = await Units.findById(id);
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    if (unit.status === "Occupied") {
      return res.status(400).json({ success: false, message: "Unit is already occupied" });
    }

    // ✅ Make sure tenant exists
    const tenant = await Tenants.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // ✅ Store reference
    unit.tenant = tenant._id;
    unit.status = "Occupied";
    await unit.save();

    // ✅ Update tenant side
    tenant.unitId = unit._id;
    await tenant.save();

    res.json({
      success: true,
      message: "Tenant assigned and unit marked as Occupied",
      data: await unit.populate("tenant") // ✅ returns tenant details
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeTenant = async (req, res) => {
  try {
    const { id } = req.params; // unitId

    const unit = await Units.findById(id);
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    unit.tenant = null; // ✅ clear reference
    unit.status = "Available";
    await unit.save();

    // ✅ Clear tenant reference
    await Tenants.findOneAndUpdate({ unitId: unit._id }, { unitId: null });

    res.json({
      success: true,
      message: "Tenant removed and unit set to Available",
      data: unit
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
