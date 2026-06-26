import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import { FileText, ChevronRight } from "lucide-react";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/reports/my").then(({ data }) => setReports(data)).catch(() => setError("Failed to load reports"));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Reports</h1>
        <p className="text-sm text-slate-500 mt-1">View all your uploaded medical reports and their status</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 text-center">{error}</div>
      )}

      {reports.length === 0 && !error && (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" strokeWidth={1} />
          <p className="text-sm text-slate-500">No reports uploaded yet.</p>
          <Link to="/upload" className="inline-block mt-3 text-sm text-blue-600 font-medium hover:text-blue-700">
            Upload your first report
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((r, i) => (
          <Link
            key={r._id}
            to={`/reports/${r._id}`}
            className="card-solid p-5 flex items-center justify-between group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-sm text-slate-600 mt-0.5 max-w-md truncate">
                  {r.extractedText?.slice(0, 120) || "No text extracted yet"}...
                </p>
                {r.aiAnalysis && (
                  <p className="text-xs text-blue-600 font-medium mt-1">{r.aiAnalysis.category}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`badge ${
                r.status === "ASSIGNED" ? "badge-green" :
                r.status === "ANALYZING" ? "badge-blue" :
                r.status === "REVIEWED" ? "badge-gray" :
                "badge-yellow"
              }`}>
                {r.status}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
