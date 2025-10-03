import express from "express";
import { 
  createTenant, 
  load, 
  getTenant, 
  update, 
  remove 
} from "../controllers/tenantsController.js";

const tenantRouter = express.Router();

// Tenant routes
tenantRouter.get("/", load);                // Get all tenants
tenantRouter.post("/create", createTenant); // Create tenant
tenantRouter.get("/:id", getTenant);        // Get tenant by ID
tenantRouter.put("/:id", update);           // Update tenant
tenantRouter.delete("/:id", remove);        // Delete tenant

export default tenantRouter;
