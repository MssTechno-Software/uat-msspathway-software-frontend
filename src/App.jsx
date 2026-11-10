import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard"
import Clients from "./pages/Clients";
import ClientLayout from "./pages/ClientLayout";
import ClientProfile from "./pages/ClientProfile";
import Applications from "./pages/Applications";
import Credential from "./pages/Credential";
import Reports from "./pages/Reports";
import ClientScheduleInterview from "./pages/ClientScheduleInterview";
import Overview from "./pages/Overview";
import ProtectedRoute from "./container/ProtectedRoutes";

import HRDashboard from "./pages/HRDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to='/login' replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/employee-dashboard/*" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/super-admin-dashboard/*" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
      {/* HR DASHBOARD — UI TESTING ONLY */}
      <Route path="/hr-dashboard/*" element={
        <ProtectedRoute>
          <HRDashboard />
        </ProtectedRoute>
      }
      />
      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />

      {/* NEW STRUCTURE */}
      <Route path="/clients/:client_id" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>

        {/*  DEFAULT PAGE (THIS OPENS FIRST) */}
        <Route index element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />

        {/* SUB PAGES */}
        <Route path="applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="credentials" element={<ProtectedRoute><Credential /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="schedule-interview" element={<ProtectedRoute><ClientScheduleInterview /></ProtectedRoute>} />
        <Route path="overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />

      </Route>
    </Routes>
  );
}

export default App;