import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /auth/register
router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }).withMessage("Username too short"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password too short"),
  ],
  async (req, res) => {
    try {
      console.log("🟢 /auth/register body:", req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("🔴 register validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        console.log("🔴 register: email already in use:", email);
        return res.status(400).json({ error: "Email already in use" });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });

      if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET missing in .env");
        return res.status(500).json({ error: "Server configuration error" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log("✅ register success:", user._id.toString());
      res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error("🔥 register exception:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /auth/login
router.post(
  "/login",
  [body("email").isEmail(), body("password").isString()],
  async (req, res) => {
    try {
      console.log("🟢 /auth/login body:", req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("🔴 login validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        console.log("🔴 login: user not found for email:", email);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        console.log("🔴 login: wrong password for:", email);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET missing in .env");
        return res.status(500).json({ error: "Server configuration error" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log("✅ login success:", user._id.toString());
      res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error("🔥 login exception:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
