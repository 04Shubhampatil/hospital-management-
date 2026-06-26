import { useState, useEffect } from "react";
import api from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import { CheckCircle, User, Loader2, Check } from "lucide-react";

export default function AssignedCases() {
  const [reports, setReports] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/doctor/reports").then(({ data }) => setReports(data)).catch(() => setError("Failed to load assigned cases"));
  }, []);

  const handleReview = async (id) => {
    setReviewing(id);
    try {
      await api.patch(`/doctor/reports/${id}/mark-reviewed`);
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status: "REVIEWED" } : r)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark as reviewed");
    } finally {
      setReviewing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Assigned Cases</h1>
        <p className="text-sm text-slate-500 mt-1">Review and manage cases assigned to you</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 text-center">{error}</div>
      )}

      {reports.length === 0 && !error && (
        <div className="card p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" strokeWidth={1} />
          <p className="text-sm text-slate-500">No assigned cases. You'll see cases here when a patient is assigned to you.</p>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((r, i) => (
          <div
            key={r._id}
            className="card-solid p-5 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-800">
                    {r.patientId?.name || r.patientId?.email}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {r.aiAnalysis?.category && (
                      <span className="badge-blue">{r.aiAnalysis.category}</span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.symptoms && (
                    <p className="text-sm text-slate-500 mt-1">{r.symptoms}</p>
                  )}
                  {r.extractedText && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.extractedText.slice(0, 200)}...</p>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {r.status === "ASSIGNED" ? (
                  <button
                    onClick={() => handleReview(r._id)}
                    disabled={reviewing === r._id}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    {reviewing === r._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Mark Reviewed
                  </button>
                ) : (
                  <span className="badge-gray">Reviewed</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
