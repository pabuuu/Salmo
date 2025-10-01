import express from "express";
import { create, load, getTenant,update } from "../controllers/tenantsController.js";

const tenantsRouter = express.Router();

//tenants route
tenantsRouter.get('/',load);
tenantsRouter.post('/create',create);
tenantsRouter.get("/:id",getTenant);
tenantsRouter.put("/:id", update);

// tenantsRouter.get('/create', (req, res) => {
//     res.json({ success: true, message: "Tenants GET route works!" });
//   }); //checker

export default tenantsRouter;
