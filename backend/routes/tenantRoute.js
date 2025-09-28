import express from "express";
import { create, load } from "../controllers/tenantsController.js";

const tenantsRouter = express.Router();

//tenants route
tenantsRouter.get('/',load);
tenantsRouter.post('/create',create);




// tenantsRouter.get('/create', (req, res) => {
//     res.json({ success: true, message: "Tenants GET route works!" });
//   }); //checker

export default tenantsRouter;
