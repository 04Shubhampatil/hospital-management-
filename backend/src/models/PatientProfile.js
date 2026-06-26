import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    phone: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PatientProfile", patientProfileSchema);
