import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // npm install node-fetch@2
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import Generation from "./models/Generation.js";
import User from "./models/User.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

mongoose.connection.on("connected", () => {
  console.log("MongoDB readyState:", mongoose.connection.readyState);
});

// Ensure index for sorting field
Generation.collection
  .createIndex({ createdAt: -1 })
  .then(() => console.log("🧭 Index created on 'createdAt'"))
  .catch((err) => console.error("⚠️ Index creation failed:", err));

// Stability API config
const apiKey = process.env.STABILITY_API_KEY;
const ENGINE_ID = "stable-diffusion-xl-1024-v1-0";

// -------------------- AUTH ROUTES --------------------

// Signup
app.post("/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log(`✅ User signed up: ${email}`);
    res.json({
      token,
      username: user.username,
      email: user.email,
      joinedDate: user.joinedDate,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log(`✅ User logged in: ${email}`);
    res.json({
      token,
      username: user.username,
      email: user.email,
      joinedDate: user.joinedDate,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- GENERATE ENDPOINT --------------------
app.post("/generate", authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    console.log(`🎨 Generating image for user ${req.user.id} with prompt: "${prompt}"`);

    const response = await fetch(
      `https://api.stability.ai/v1/generation/${ENGINE_ID}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    const data = await response.json();

    if (!data.artifacts || !data.artifacts[0].base64)
      throw new Error("No image returned from Stability API");

    const imageBase64 = data.artifacts[0].base64;
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    const generation = new Generation({
      user: req.user.id,
      prompt,
      image: imageUrl,
    });

    await generation.save();
    console.log(`💾 Saved generation to MongoDB: ${generation._id}`);

    res.json({ image: imageUrl });
  } catch (err) {
    console.error("❌ Stability AI error:", err);
    res.status(500).json({ error: err.message || "Failed to generate image" });
  }
});

// -------------------- HISTORY ENDPOINT --------------------
app.get("/history", authMiddleware, async (req, res) => {
  try {
    const generations = await Generation.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100) // ✅ limit to avoid large memory use
      .allowDiskUse(true); // ✅ allow MongoDB to use disk sorting

    console.log(`🕒 Fetched ${generations.length} history items for user ${req.user.id}`);
    res.json(generations);
  } catch (err) {
    console.error("❌ Fetch history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// -------------------- START SERVER--------------------
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

