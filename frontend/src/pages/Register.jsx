import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { UserPlus } from "lucide-react";

const CATEGORIES = [
  "General Physician", "Cardiologist", "Dermatologist", "Orthopedic",
  "Neurologist", "Pediatrician", "Ophthalmologist", "ENT Specialist",
  "Psychiatrist", "Gynecologist", "Pulmonologist", "Endocrinologist",
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [category, setCategory] = useState("General Physician");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [error, setError] = useState("");
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password, role, { category, specialization, experienceYears });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-500 opacity-5 pointer-events-none" />
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/30 mb-3 sm:mb-4">
            <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Join the hospital management system</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-5 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field text-sm"
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {role === "DOCTOR" && (
            <div className="space-y-3 sm:space-y-4 animate-slide-up border-t border-slate-100 pt-3 sm:pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Experience</label>
                  <input
                    type="number"
                    placeholder="Years"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(+e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Interventional Cardiology"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {role === "ADMIN" && (
            <div className="text-xs sm:text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center animate-slide-up">
              Admin accounts have full system access. Use responsibly.
            </div>
          )}

          <button type="submit" className="btn-primary mt-1 sm:mt-2 text-sm">
            Create Account
          </button>

          <p className="text-xs sm:text-sm text-center text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
