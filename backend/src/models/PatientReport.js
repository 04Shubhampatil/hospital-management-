import mongoose from "mongoose";

const patientReportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filePath: { type: String, required: true },
    symptoms: { type: String, default: "" },
    extractedText: { type: String, default: "" },
    aiAnalysis: { type: mongoose.Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["PENDING", "ANALYZING", "ASSIGNED", "REVIEWED"],
      default: "PENDING",
    },
    assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("PatientReport", patientReportSchema);
