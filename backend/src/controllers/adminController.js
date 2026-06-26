import PatientReport from "../models/PatientReport.js";
import { analyzeText } from "../services/ai.js";

export async function getAllReports(req, res, next) {
  try {
    const reports = await PatientReport.find()
      .populate("patientId", "name email")
      .populate("assignedDoctorId", "name email")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    next(err);
  }
}

export async function assignDoctor(req, res, next) {
  try {
    const { doctorId } = req.body;
    const report = await PatientReport.findByIdAndUpdate(
      req.params.id,
      { assignedDoctorId: doctorId, status: "ASSIGNED" },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    next(err);
  }
}

export async function reanalyzeReport(req, res, next) {
  try {
    const report = await PatientReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const text = report.extractedText || "";
    const analysis = await analyzeText(text);
    report.aiAnalysis = analysis;
    report.assignedDoctorId = null;
    report.status = "PENDING";
    await report.save();

    res.json({ message: "Re-analysis complete", report });
  } catch (err) {
    next(err);
  }
}
