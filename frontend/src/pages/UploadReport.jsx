import { useState } from "react";
import api from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import { CheckCircle, Upload, Loader2, AlertTriangle, FileText, X } from "lucide-react";

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("symptoms", symptoms);

      const { data: uploadData } = await api.post("/reports/upload", formData);
      const { data: processData } = await api.post(`/reports/${uploadData.report._id}/extract-text`);

      setResult(processData.report);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Upload Medical Report</h1>
          <p className="text-sm text-slate-500 mt-1">Upload a prescription or medical report for AI-powered analysis and doctor assignment</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Report File
            </label>
            <div className={`group relative border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out ${
              file 
                ? "border-blue-400 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-2" 
                : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/10 bg-slate-50"
            }`}>
              {file ? (
                <div className="relative flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full shadow-inner">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1 truncate max-w-[200px] sm:max-w-[300px]" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFile(null)} 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-10 w-full h-full">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 group-hover:shadow-md group-hover:bg-blue-50 transition-all duration-300 ring-4 ring-slate-50 group-hover:ring-blue-50">
                    <Upload className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-base font-medium text-slate-700 mb-1">
                    <span className="text-blue-600 hover:text-blue-700 underline-offset-4 group-hover:underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-slate-500">PDF, PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms (optional)</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Describe any symptoms you're experiencing..."
            />
          </div>

          <button type="submit" disabled={loading || !file} className="btn-primary flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload & Analyze
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 animate-slide-up">
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                Analysis Result
              </h2>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Status:</span>
                <span className={`badge ${
                  result.status === "ASSIGNED" ? "badge-green" :
                  result.status === "ANALYZING" ? "badge-blue" :
                  result.status === "REVIEWED" ? "badge-gray" :
                  "badge-yellow"
                }`}>
                  {result.status}
                </span>
              </div>

              {result.aiAnalysis && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50/80 rounded-xl p-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Predicted Category</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{result.aiAnalysis.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Confidence</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{result.aiAnalysis.confidence}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Method</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{result.aiAnalysis.method}</p>
                  </div>
                  {result.aiAnalysis.reasoning && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reasoning</p>
                      <p className="text-sm text-slate-600 mt-0.5">{result.aiAnalysis.reasoning}</p>
                    </div>
                  )}
                </div>
              )}

              {result.status === "ASSIGNED" ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 text-sm font-medium border border-emerald-100">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  Doctor assigned automatically based on the predicted category
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-4 py-3 text-sm font-medium border border-amber-100">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  No matching doctor found. An admin can assign one manually.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
