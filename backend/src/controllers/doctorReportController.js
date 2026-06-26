import PatientReport from "../models/PatientReport.js";

export async function getAssignedReports(req, res, next) {
  try {
    const reports = await PatientReport.find({ assignedDoctorId: req.user.id, status: "ASSIGNED" })
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    next(err);
  }
}

export async function markReviewed(req, res, next) {
  try {
    const report = await PatientReport.findOneAndUpdate(
      { _id: req.params.id, assignedDoctorId: req.user.id },
      { status: "REVIEWED" },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found or not assigned to you" });
    res.json(report);
  } catch (err) {
    next(err);
  }
}
