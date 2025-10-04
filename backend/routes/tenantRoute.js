import express from "express";
import { createTenant, load, getTenant,update,archiveTenant,restore } from "../controllers/tenantsController.js";

const tenantRouter = express.Router();

// Tenant routes
tenantRouter.get("/", load);                // Get all tenants
tenantRouter.post("/create", createTenant); // Create tenant
//tenantRouter.post("/create", create); original
tenantRouter.get("/:id", getTenant);        // Get tenant by ID
tenantRouter.put("/:id", update); 
tenantsRouter.patch("/:id/archive", archiveTenant);// Delete tenant
tenantsRouter.patch("/:id/restore", restore);

export default tenantRouter;
