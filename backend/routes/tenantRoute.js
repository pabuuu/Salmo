import express from "express";
import { create, load, getTenant,update,archiveTenant,restore } from "../controllers/tenantsController.js";

const tenantsRouter = express.Router();

//tenants route
tenantsRouter.get('/',load);
tenantsRouter.post('/create',create);
tenantsRouter.get("/:id",getTenant);
tenantsRouter.put("/:id", update);
tenantsRouter.patch("/:id/archive", archiveTenant);
tenantsRouter.patch("/:id/restore", restore);

// tenantsRouter.get('/create', (req, res) => {
//     res.json({ success: true, message: "Tenants GET route works!" });
//   }); //checker

export default tenantsRouter;
