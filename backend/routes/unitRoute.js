import express from "express";
import {
  load,
  getAvailableByLocation,
  create,
  remove,
  update,
  getOne,
  assignTenant,
  removeTenant
} from "../controllers/unitsController.js";

const unitRouter = express.Router();

// Always put more specific routes BEFORE "/:id"
unitRouter.get("/", load);
unitRouter.get("/getAvailableByLocation", getAvailableByLocation);
unitRouter.post("/create", create);

// Debug route must be ABOVE "/:id"
unitRouter.get("/debug/all", async (req, res) => {
  try {
    const units = await import("../models/Units.js").then(m => m.default.find());
    res.json(units);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

unitRouter.get("/:id", getOne);
unitRouter.put("/:id", update);
unitRouter.delete("/:id", remove);
unitRouter.post("/:id/assignTenant", assignTenant);
unitRouter.post("/:id/removeTenant", removeTenant);

export default unitRouter;
