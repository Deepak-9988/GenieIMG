import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route without using Stability API (dummy image)
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("Prompt received:", prompt);

    // Dummy 1x1 pixel base64 image (for testing without credits)
    const dummyImage =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgJ9Pj1EAAAAASUVORK5CYII=";

    res.json({ image: dummyImage });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
