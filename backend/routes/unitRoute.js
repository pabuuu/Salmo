import express from "express";
import { create, load, remove, update } from "../controllers/unitsController.js";

const unitsRouter = express.Router();

unitsRouter.get("/", load);          // Fetch all
unitsRouter.post("/create", create); // Create
unitsRouter.delete("/:id", remove);  // Delete by ID
unitsRouter.put("/:id", update);     // Update by ID

export default unitsRouter;
