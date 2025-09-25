// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();

// ===== Middleware =====
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error(err));

// ===== Simple User Model (temporary) =====
// Later: put this in /models/User.js
const userSchema = new mongoose.Schema({
  username: String,
  password: String, // hashed
});
const User = mongoose.model("User", userSchema);

// ===== Helper: JWT Auth Middleware =====
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// ===== Routes =====

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from Backend ✅" });
});

// Register (optional helper for testing)
// 👉 This lets you create a test user via POSTMAN or frontend
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.json({ success: true, message: "User registered" });
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ success: true, token });
});

// Protected Route
app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}! This is protected data.` });
});

// ===== Server Start =====
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
