import express from "express";
import { 
  createTenant, 
  load, 
  getTenants, 
  update, 
  archiveTenant,
  deleteTenant      // <- import deleteTenant
} from "../controllers/tenantsController.js";

const tenantRouter = express.Router();

tenantRouter.get("/", load);
tenantRouter.post("/create", createTenant);
tenantRouter.get("/:id", getTenants);
tenantRouter.put("/:id", update);
tenantRouter.put("/:id/archive", archiveTenant);
tenantRouter.delete("/:id", deleteTenant);   // <- add DELETE route

export default tenantRouter;
