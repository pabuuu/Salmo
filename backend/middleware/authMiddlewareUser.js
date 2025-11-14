// authMiddlewareUser.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddlewareUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized: Missing token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) return res.status(401).json({ message: "Unauthorized: Invalid token" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });

    req.userId = user._id; // attach userId for controllers
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware User Error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
