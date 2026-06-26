import PatientReport from "../models/PatientReport.js";
import { extractText } from "../services/ocr.js";
import { analyzeText } from "../services/ai.js";
import DoctorProfile from "../models/DoctorProfile.js";

export async function uploadReport(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const report = await PatientReport.create({
      patientId: req.user.id,
      filePath: req.file.path,
      symptoms: req.body.symptoms || "",
    });

    res.status(201).json({ message: "Report uploaded", report });
  } catch (err) {
    next(err);
  }
}

export async function getMyReports(req, res, next) {
  try {
    const reports = await PatientReport.find({ patientId: req.user.id })
      .populate("assignedDoctorId", "name email")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    next(err);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await PatientReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const isOwner = report.patientId?.toString() === req.user.id;
    const isAssignedDoctor = report.assignedDoctorId?.toString() === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAssignedDoctor && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await report.populate("patientId", "name email");
    await report.populate("assignedDoctorId", "name email");

    res.json(report);
  } catch (err) {
    next(err);
  }
}

export async function extractTextFromReport(req, res, next) {
  try {
    const report = await PatientReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const text = await extractText(report.filePath);
    report.extractedText = text;
    report.status = "ANALYZING";
    await report.save();

    const analysis = await analyzeText(text);
    report.aiAnalysis = analysis;
    report.status = "PENDING";
    await report.save();

    const doctor = await assignDoctorByCategory(analysis.category);
    if (doctor) {
      report.assignedDoctorId = doctor.userId._id;
      report.status = "ASSIGNED";
      await report.save();
    }

    res.json({ message: "OCR and analysis complete", report });
  } catch (err) {
    next(err);
  }
}

async function assignDoctorByCategory(category) {
  const doctor = await DoctorProfile.findOne({ category, isAvailable: true }).populate("userId");
  if (doctor) return doctor;

  if (category !== "General Physician") {
    const fallback = await DoctorProfile.findOne({ category: "General Physician", isAvailable: true }).populate("userId");
    if (fallback) return fallback;
  }

  return DoctorProfile.findOne({ isAvailable: true }).populate("userId");
}

export async function analyzeReport(req, res, next) {
  try {
    const report = await PatientReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = "ANALYZING";
    await report.save();

    const text = report.extractedText || "";
    const analysis = await analyzeText(text);
    report.aiAnalysis = analysis;
    report.status = "PENDING";
    await report.save();

    const doctor = await assignDoctorByCategory(analysis.category);
    if (doctor) {
      report.assignedDoctorId = doctor.userId._id;
      report.status = "ASSIGNED";
      await report.save();
    }

    res.json({ message: "Analysis complete", report });
  } catch (err) {
    next(err);
  }
}
