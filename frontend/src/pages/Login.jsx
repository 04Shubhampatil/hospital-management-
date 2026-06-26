import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Activity } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-500 opacity-5 pointer-events-none" />
      <div className="w-full max-w-sm sm:max-w-md animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/30 mb-3 sm:mb-4">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center">
              {error}
            </div>
          )}

          <div>
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

          <button type="submit" className="btn-primary text-sm">
            Sign In
          </button>

          <p className="text-xs sm:text-sm text-center text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
