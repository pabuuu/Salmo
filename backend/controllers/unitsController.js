import Units from "../models/Units.js";

// Load all units OR filter by location
export const load = async (req, res) => {
  try {
    const { location } = req.query; // e.g. ?location=MH Del Pilar
    const query = location ? { location } : {};
    const units = await Units.find(query); // DB handles filtering
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

    // ✅ Optional: if updating unitNo/location, re-check uniqueness
    if (updateData.unitNo || updateData.location) {
      const unit = await Units.findById(id);
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

    const updated = await Units.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, message: "Unit updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
