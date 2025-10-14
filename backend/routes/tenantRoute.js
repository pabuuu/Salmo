import express from "express";
import { 
  createTenant, 
  load, 
  getTenants, 
  update, 
  archiveTenant
} from "../controllers/tenantsController.js";

const tenantRouter = express.Router();

// Tenant routes
tenantRouter.get("/", load);                // Get all tenants
tenantRouter.post("/create", createTenant); // Create tenant
tenantRouter.get("/:id", getTenants);        // Get tenant by ID
tenantRouter.put("/:id", update);           // Update tenant
tenantRouter.put("/:id/archive", archiveTenant);

export default tenantRouter;
