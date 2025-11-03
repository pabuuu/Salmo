// authMiddleware.js
import jwt from "jsonwebtoken";
import Tenants from "../models/Tenants.js"; // point to your Tenants model

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Find tenant by decoded ID
    const tenant = await Tenants.findById(decoded.id);
    if (!tenant) {
      return res.status(401).json({ message: "Unauthorized: Tenant not found" });
    }

    // Attach tenantId to request for downstream controllers
    req.tenantId = tenant._id;
    req.tenant = tenant; // optional: attach full tenant object if needed
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
