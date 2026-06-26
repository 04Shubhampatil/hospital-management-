import { useState, useEffect } from "react";
import api from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";

export default function AllReports() {
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/reports").then(({ data }) => setReports(data)).catch(() => setError("Failed to load reports"));
    api.get("/doctors").then(({ data }) => setDoctors(data)).catch(() => {});
  }, []);

  const handleAssign = async (reportId, doctorId) => {
    if (!doctorId) return;
    try {
      await api.patch(`/admin/reports/${reportId}/assign-doctor`, { doctorId });
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, assignedDoctorId: { _id: doctorId, name: doctors.find(d => (d.userId?._id || d._id) === doctorId)?.userId?.name }, status: "ASSIGNED" } : r))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign doctor");
    }
  };

  const handleReanalyze = async (reportId) => {
    try {
      await api.post(`/admin/reports/${reportId}/reanalyze`);
      const { data } = await api.get("/admin/reports");
      setReports(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reanalyze report");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">All Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and assign patient reports to doctors</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 text-center">{error}</div>
      )}

      <div className="card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left font-semibold text-slate-600 p-4">Patient</th>
                <th className="text-left font-semibold text-slate-600 p-4">Category</th>
                <th className="text-left font-semibold text-slate-600 p-4">Status</th>
                <th className="text-left font-semibold text-slate-600 p-4">Doctor</th>
                <th className="text-right font-semibold text-slate-600 p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="p-4 font-medium text-slate-800">{r.patientId?.name || r.patientId?.email}</td>
                  <td className="p-4">
                    {r.aiAnalysis?.category ? (
                      <span className="badge-blue">{r.aiAnalysis.category}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${
                      r.status === "ASSIGNED" ? "badge-green" :
                      r.status === "ANALYZING" ? "badge-blue" :
                      r.status === "REVIEWED" ? "badge-gray" :
                      "badge-yellow"
                    }`}>{r.status}</span>
                  </td>
                  <td className="p-4 text-slate-600">{r.assignedDoctorId?.name || "—"}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        className="input-field text-xs py-1.5 w-auto"
                        onChange={(e) => handleAssign(r._id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign doctor</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d.userId?._id || d._id}>
                            {d.userId?.name} ({d.category})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleReanalyze(r._id)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Re-analyze
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sm text-slate-400">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
