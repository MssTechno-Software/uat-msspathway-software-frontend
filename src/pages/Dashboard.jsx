import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../container/Sidebar";
import Clients from "./Clients";
import JobOpening from "./JobOpening";
import WorkApproval from "./WorkApproval";
import Timesheet from "./Timesheet";
import AddClient from "./AddClient";
import LeaveRequests from "./LeaveRequest";
import Employee from "./Employee";
import AddEmployee from "./AddEmployee";
import EmployeeProfile from "./EmployeeProfile";
import MyProfilePage from "./MyProfilePage";
import EmployeeTimesheetDetails from "./EmployeeTimesheetDetails";
import { getUserRole } from "../services/authSession";
function Dashboard() {
    const role = getUserRole();
    // Block employee users
    if (role === "employee") {
        return <Navigate to="/employee-dashboard" />;
    }

    return (
        <div className="flex min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 p-3">
                <Routes>
                    <Route path="/" element={<Navigate to="clients" />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="jobopenings" element={<JobOpening />} />
                    <Route path="work-approval" element={<WorkApproval />} />
                    <Route  path="work-approval/timesheet/employee/:employee_code" element={<EmployeeTimesheetDetails />}/>
                    <Route path="timesheet" element={<Timesheet />} />
                    <Route path="employee" element={<Employee />} />
                    <Route path="add-employee" element={<AddEmployee />} />
                    <Route path="employees/:employee_id" element={<EmployeeProfile />} />
                    <Route path="leave-requests" element={<LeaveRequests />} />
                    <Route path="add-client" element={<AddClient />} />
                    <Route path="my-profile/:employee_id" element={<MyProfilePage />} />
                </Routes>
            </div>

        </div>
    );
}
export default Dashboard;