import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadReport from "./pages/UploadReport";
import MyReports from "./pages/MyReports";
import ReportDetails from "./pages/ReportDetails";
import AssignedCases from "./pages/AssignedCases";
import AllReports from "./pages/AllReports";
import DoctorManagement from "./pages/DoctorManagement";

function HomeRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "PATIENT") return <Navigate to="/upload" replace />;
  if (user.role === "DOCTOR") return <Navigate to="/doctor/reports" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/reports" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/upload"
        element={<ProtectedRoute roles={["PATIENT"]}><UploadReport /></ProtectedRoute>}
      />
      <Route
        path="/reports"
        element={<ProtectedRoute roles={["PATIENT"]}><MyReports /></ProtectedRoute>}
      />
      <Route
        path="/reports/:id"
        element={<ProtectedRoute roles={["PATIENT", "ADMIN", "DOCTOR"]}><ReportDetails /></ProtectedRoute>}
      />
      <Route
        path="/doctor/reports"
        element={<ProtectedRoute roles={["DOCTOR"]}><AssignedCases /></ProtectedRoute>}
      />
      <Route
        path="/admin/reports"
        element={<ProtectedRoute roles={["ADMIN"]}><AllReports /></ProtectedRoute>}
      />
      <Route
        path="/admin/doctors"
        element={<ProtectedRoute roles={["ADMIN"]}><DoctorManagement /></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
