import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import { Loader2, FileText, Sparkles } from "lucide-react";

export default function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get(`/reports/${id}`).then(({ data }) => setReport(data));
  }, [id]);

  if (!report) return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Report Details</h1>
          <p className="text-sm text-slate-500 mt-1">Uploaded on {new Date(report.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`badge ${
                report.status === "ASSIGNED" ? "badge-green" :
                report.status === "ANALYZING" ? "badge-blue" :
                report.status === "REVIEWED" ? "badge-gray" :
                "badge-yellow"
              }`}>{report.status}</span>
              <span className="text-sm text-slate-400">Report #{report._id.slice(-6).toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {report.symptoms && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Symptoms</p>
                  <p className="text-sm text-slate-700">{report.symptoms}</p>
                </div>
              )}
              {report.assignedDoctorId && (
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Assigned Doctor</p>
                  <p className="text-sm font-medium text-slate-700">
                    {report.assignedDoctorId?.name || report.assignedDoctorId?.email || report.assignedDoctorId?._id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {report.extractedText && (
            <div className="card p-6 animate-slide-up">
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Extracted Text
              </h2>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {report.extractedText}
              </div>
            </div>
          )}

          {report.aiAnalysis && (
            <div className="card p-6 animate-slide-up">
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                AI Analysis
              </h2>
              <div className="grid grid-cols-3 gap-4 bg-gradient-to-br from-blue-50/50 to-blue-50/30 rounded-xl p-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Category</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{report.aiAnalysis.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Confidence</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{report.aiAnalysis.confidence}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Method</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{report.aiAnalysis.method}</p>
                </div>
                {report.aiAnalysis.reasoning && (
                  <div className="col-span-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Reasoning</p>
                    <p className="text-sm text-slate-600 mt-0.5">{report.aiAnalysis.reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
