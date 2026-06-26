import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Upload, FileText, ClipboardList, Folders, Users, Activity, LogOut, Menu, X } from "lucide-react";

const navItems = {
  PATIENT: [
    { label: "Upload Report", path: "/upload", icon: Upload },
    { label: "My Reports", path: "/reports", icon: FileText },
  ],
  DOCTOR: [
    { label: "Assigned Cases", path: "/doctor/reports", icon: ClipboardList },
  ],
  ADMIN: [
    { label: "All Reports", path: "/admin/reports", icon: Folders },
    { label: "Doctors", path: "/admin/doctors", icon: Users },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const items = navItems[user?.role] || [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col shrink-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-800">MediFlow</h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">Hospital System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-2 sm:p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-800"
                }`}
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? "text-blue-500" : "text-slate-400"}`} />
                <span className="text-xs sm:text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 sm:p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-slate-50/80">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">{user?.name}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">MediFlow</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
