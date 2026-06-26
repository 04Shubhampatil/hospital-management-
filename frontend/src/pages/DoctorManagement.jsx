import { useState, useEffect } from "react";
import api from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import { Plus } from "lucide-react";

const CATEGORIES = [
  "General Physician", "Cardiologist", "Dermatologist", "Orthopedic",
  "Neurologist", "Pediatrician", 
];

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", category: "General Physician", specialization: "", experienceYears: 0 });

  useEffect(() => {
    api.get("/doctors").then(({ data }) => setDoctors(data)).catch(() => setError("Failed to load doctors"));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/doctors", form);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", category: "General Physician", specialization: "", experienceYears: 0 });
      const { data } = await api.get("/doctors");
      setDoctors(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create doctor");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctor Management</h1>
          <p className="text-sm text-slate-500 mt-1">Add and manage doctor profiles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary !w-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add Doctor"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 text-center">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-8 space-y-4 max-w-lg animate-slide-up">
          <h2 className="text-base font-bold text-slate-700">New Doctor</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
              <input
                placeholder="Dr. John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              <input
                type="email" placeholder="doctor@hospital.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
              <input
                type="password" placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field" required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Experience</label>
              <input
                type="number" placeholder="Years"
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: +e.target.value })}
                className="input-field"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Specialization</label>
              <input
                placeholder="e.g. Interventional Cardiology"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary !w-auto">Create Doctor</button>
        </form>
      )}

      <div className="card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left font-semibold text-slate-600 p-4">Name</th>
                <th className="text-left font-semibold text-slate-600 p-4">Email</th>
                <th className="text-left font-semibold text-slate-600 p-4">Category</th>
                <th className="text-left font-semibold text-slate-600 p-4">Experience</th>
                <th className="text-right font-semibold text-slate-600 p-4">Available</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d, i) => (
                <tr key={d._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="p-4 font-medium text-slate-800">{d.userId?.name}</td>
                  <td className="p-4 text-slate-600">{d.userId?.email}</td>
                  <td className="p-4"><span className="badge-blue">{d.category}</span></td>
                  <td className="p-4 text-slate-600">{d.experienceYears} yrs</td>
                  <td className="p-4 text-right">
                    {d.isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                        Unavailable
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sm text-slate-400">No doctors registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
