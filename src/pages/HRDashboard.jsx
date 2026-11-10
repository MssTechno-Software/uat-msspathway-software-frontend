import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../container/Sidebar";

import HRDashboardPage from "./HRDashboardPage";
import HRLeaveManagement from "./HRLeaveManagement";
import HRPayroll from "./HRPayroll";
import HRReports from "./HRReports";

function HRDashboard() {
    return (
        <Sidebar>
            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="dashboard" />}
                />

                <Route
                    path="dashboard"
                    element={<HRDashboardPage />}
                />

                <Route
                    path="leave-management"
                    element={<HRLeaveManagement />}
                />

                <Route
                    path="payroll"
                    element={<HRPayroll />}
                />

                <Route
                    path="reports"
                    element={<HRReports />}
                />

            </Routes>
        </Sidebar>
    );
}

export default HRDashboard;