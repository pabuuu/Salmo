import express from "express";
import { 
  createTenant, 
  load, 
  getTenants, 
  update, 
  archiveTenant,
  deleteTenant,      // <- import deleteTenant
  getTenant,
  assignUnit
} from "../controllers/tenantsController.js";
import multer from "multer";

const tenantRouter = express.Router();
// const upload = multer();
const upload = multer();

tenantRouter.get("/", load);
tenantRouter.post("/create", upload.single("receipt"), createTenant);
tenantRouter.get("/:id", getTenant);        
tenantRouter.put("/:id", update);
tenantRouter.put("/:id/archive", archiveTenant);
tenantRouter.delete("/:id", deleteTenant);  
tenantRouter.put("/:id/assign-unit", assignUnit);

export default tenantRouter;
