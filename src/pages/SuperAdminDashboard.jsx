import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../container/Sidebar";
import Clients from "./Clients";
import JobOpening from "./JobOpening";
import Timesheet from "./Timesheet";
import Employees from "./Employee";
import LeaveRequests from "./LeaveRequest";
import WorkApproval from "./WorkApproval";
import EmployeeTimesheetDetails from "./EmployeeTimesheetDetails";

// HR Pages
import HRDashboardPage from "./HRDashboardPage";
import HRLeaveManagement from "./HRLeaveManagement";
import HRPayroll from "./HRPayroll";
import HRReports from "./HRReports";

function SuperAdminDashboard() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 p-3">
                <Routes>
                    <Route path="/" element={<Navigate to="clients" />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="jobopenings" element={<JobOpening />} />
                    <Route path="timesheet" element={<Timesheet />} />
                    <Route path="work-approval" element={<WorkApproval />} />
                    <Route path="work-approval/timesheet/employee/:employee_code"element={<EmployeeTimesheetDetails />}/>
                    <Route path="timesheet" element={<Timesheet />} />
                    <Route path="leave-requests" element={<LeaveRequests />} />
                    <Route path="employees" element={<Employees />} />

                    {/* HR DASHBOARD ROUTES */}
                    <Route
                        path="hr-dashboard/dashboard"
                        element={<HRDashboardPage />}
                    />

                    <Route
                        path="hr-dashboard/leave-management"
                        element={<HRLeaveManagement />}
                    />

                    <Route
                        path="hr-dashboard/payroll"
                        element={<HRPayroll />}
                    />

                    <Route
                        path="hr-dashboard/reports"
                        element={<HRReports />}
                    />

                </Routes>
            </div>
        </div>
    );
}

export default SuperAdminDashboard;