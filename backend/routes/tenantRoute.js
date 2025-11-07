import express from "express";
import { 
  createTenant, 
  load, 
  getTenants, 
  update, 
  archiveTenant,
  deleteTenant,      
  getTenant,
  assignUnit,
  upload
} from "../controllers/tenantsController.js";
import multer from "multer";

const tenantRouter = express.Router();
// const upload = multer();
// const upload = multer();

tenantRouter.get("/", load);
tenantRouter.post(
  "/create",
  upload.fields([
    { name: "receipt", maxCount: 1 },
    { name: "contractFile", maxCount: 1 },
  ]),
  createTenant
);

tenantRouter.get("/:id", getTenant);        
tenantRouter.put("/:id", update);
tenantRouter.put("/:id/archive", archiveTenant);
tenantRouter.delete("/:id", deleteTenant);  
tenantRouter.put("/:id/assign-unit", assignUnit);

export default tenantRouter;
