import mongoose from "mongoose";

const testSchema = new mongoose.Schema({ note: String }, { timestamps: true });
export default mongoose.model("Test", testSchema);
