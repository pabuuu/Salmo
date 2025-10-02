import express from "express";
import { create, load, remove, update, getOne } from "../controllers/unitsController.js";

const unitsRouter = express.Router();

unitsRouter.get("/:id", getOne);     // ✅ Fetch single unit by ID
unitsRouter.get("/", load);          // Fetch all
unitsRouter.post("/create", create); // Create
unitsRouter.delete("/:id", remove);  // Delete by ID
unitsRouter.put("/:id", update);     // Update by ID

export default unitsRouter;
