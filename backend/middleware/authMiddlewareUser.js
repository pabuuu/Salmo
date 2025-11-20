import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddlewareUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Missing or invalid auth header");
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token received:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    if (!decoded?.id) {
      console.warn("JWT missing id");
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded.id);
    console.log("User fetched from DB:", user);

    if (!user) {
      console.warn("User not found in DB");
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.userId = user._id;
    req.user = user.toObject(); // <-- convert Mongoose doc to plain JS object
    console.log("req.user set for controller:", req.user);

    next();
  } catch (err) {
    console.error("Auth Middleware User Error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
