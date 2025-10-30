// models/Generation.js
import mongoose from "mongoose";

const generationSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Store user ID
  prompt: { type: String, required: true },
  image: { type: String, required: true }, // Base64 image
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Generation", generationSchema);
