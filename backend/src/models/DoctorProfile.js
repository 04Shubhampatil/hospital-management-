import mongoose from "mongoose";

const CATEGORIES = [
  "General Physician", "Cardiologist", "Dermatologist", "Orthopedic",
  "Neurologist", "Pediatrician",
];

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    category: { type: String, enum: CATEGORIES, required: true },
    specialization: { type: String },
    experienceYears: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    
  },
  { timestamps: true }
);

export { CATEGORIES };
export default mongoose.model("DoctorProfile", doctorProfileSchema);
