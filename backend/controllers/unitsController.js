import Units from "../models/Units.js";

// Load all units
export const load = async (req, res) => {
  try {
    const units = await Units.find();
    res.json({ success: true, data: units, message: "Units loaded successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new unit
export const create = async (req, res) => {
  try {
    const { unitNo, type, rentAmount, status, location, notes } = req.body;

    const existing = await Units.findOne({ unitNo });
    if (existing) {
      return res.status(400).json({ success: false, message: "Unit already exists" });
    }

    const unit = new Units({ unitNo, type, rentAmount, status, location, notes });
    await unit.save();

    res.json({ success: true, message: "Unit created successfully", data: unit });
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
    const updated = await Units.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, message: "Unit updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
