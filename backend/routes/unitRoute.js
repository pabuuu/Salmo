import express from "express";
import {
  load,
  getAvailableByLocation,
  create,
  remove,
  update,
  getOne,
  assignTenant,
  removeTenant,
  getAvailableLocations,
} from "../controllers/unitsController.js";

const unitRouter = express.Router();

unitRouter.get("/locations", getAvailableLocations);
unitRouter.get("/getAvailableByLocation", getAvailableByLocation);
unitRouter.get("/debug/all", async (req, res) => {
  try {
    const units = await import("../models/Units.js").then(m => m.default.find());
    res.json(units);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

unitRouter.get("/", load);
unitRouter.post("/create", create);
unitRouter.get("/:id", getOne);
unitRouter.put("/:id", update);
unitRouter.delete("/:id", remove);
unitRouter.post("/:id/assignTenant", assignTenant);
unitRouter.post("/:id/removeTenant", removeTenant);

export default unitRouter;
