import { NavLink, useNavigate } from "react-router-dom";

import {
    FiUsers,
    FiClock,
    FiArrowLeft,
    FiUser,
    FiChevronLeft,
    FiChevronRight,
    FiLogOut
} from "react-icons/fi";

import { FaUserTie } from "react-icons/fa";

import { useState } from "react";
import axios from "axios";

function Sidebar({ children }) {
    const navigate = useNavigate();
    const role = localStorage
        .getItem("role")
        ?.toLowerCase()
        ?.trim();
    console.log("ROLE:", role);
    const employee_id = localStorage.getItem("employee_id");
    const [openSidebar, setOpenSidebar] = useState(false);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");

            console.log("Logout Token:", token);

            const response = await axios.post(
                "https://timesheet-api-790373899641.asia-south1.run.app/auth/logout",
                null,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Logout Response:", response.data);

        } catch (error) {

            console.error(
                "Logout Error:",
                error.response?.data || error.message
            );

        } finally {

            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            localStorage.removeItem("employee_id");
            localStorage.removeItem("role");

            navigate("/login");
        }
    };
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="flex min-h-screen">

            {/* SIDEBAR */}
            <div
                className={`
                    fixed top-0 left-0 h-screen z-40
                    bg-[#301E0F] text-white
                    transition-all duration-300
                    ${openSidebar ? "w-64" : "w-20"}
                `}
            >

                {/* TOGGLE BUTTON */}
                <button
                    onClick={() => setOpenSidebar(!openSidebar)}
                    className="
                        absolute
                        top-5
                        -right-5
                        transition-all
                        bg-green-800
                        text-white
                        shadow-md
                        rounded-full
                        p-2
                        z-50
                        cursor-pointer
                    "
                >
                    {openSidebar ? (
                        <FiChevronLeft size={20} />
                    ) : (
                        <FiChevronRight size={20} />
                    )}
                </button>

                <div className="p-4 h-full flex flex-col">

                    {/* HEADER */}
                    {/* <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-6"> */}
                    {/* BACK BUTTON */}
                    {/* <button
                            onClick={handleBack}
                            className="
                                flex items-center justify-center
                                w-10 h-10
                                cursor-pointer hover:text-gray-300
                                transition-all duration-200
                            "
                        >
                            <FiArrowLeft size={20} />
                        </button> */}
                    <div
                        className={`flex items-center ${openSidebar ? "gap-3" : "justify-center"} mb-10 border-b border-white/10 pb-6`}
                    >
                        <img
                            src="/title_mss_logo.png"
                            alt="logo"
                            className="w-10 h-10 object-contain"
                        />

                        {openSidebar && (
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    MSS Techno
                                </h2>

                                <p className="text-sm text-gray-300">
                                    {role === "employee"
                                        ? "Employee Dashboard"
                                        : role === "admin"
                                            ? "Admin Dashboard"
                                            : role === "super admin"
                                                ? "Super Admin Dashboard"
                                                : "Dashboard"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* MENU */}
                    <nav className="space-y-2 flex-1">

                        {/* MY PROFILE */}
                        {role !== "super admin" && (
                            <NavLink
                                to={
                                    role === "employee"
                                        ? `/employee-dashboard/my-profile/${employee_id}`
                                        : `/dashboard/my-profile/${employee_id}`
                                }
                                className={({ isActive }) =>
                                    `
                                flex items-center gap-3
                                px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive
                                        ? "bg-green-800"
                                        : "hover:bg-green-700"
                                    }
                                `
                                }
                            >
                                <FiUser size={20} />

                                {openSidebar && (
                                    <span>My Profile</span>
                                )}
                            </NavLink>
                        )}

                        {/* CLIENTS */}
                        <NavLink
                            to={
                                role === "employee"
                                    ? "/employee-dashboard/clients"
                                    : "/dashboard/clients"
                            }
                            className={({ isActive }) =>
                                `
                                flex items-center gap-3
                                px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive
                                    ? "bg-green-800"
                                    : "hover:bg-green-700"
                                }
                                `
                            }
                        >
                            <FiUsers size={20} />

                            {openSidebar && (
                                <span>Clients</span>
                            )}
                        </NavLink>

                        {/* TIMESHEET */}
                        <NavLink
                            to={
                                role === "employee"
                                    ? "/employee-dashboard/timesheet"
                                    : "/dashboard/timesheet"
                            }
                            className={({ isActive }) =>
                                `
                                flex items-center gap-3
                                px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive
                                    ? "bg-green-800"
                                    : "hover:bg-green-700"
                                }
                                `
                            }
                        >
                            <FiClock size={20} />

                            {openSidebar && (
                                <span>Timesheet</span>
                            )}
                        </NavLink>

                        {/* EMPLOYEE */}
                        {role !== "employee" && (
                            <NavLink
                                to="/dashboard/employee"
                                className={({ isActive }) =>
                                    `
                                    flex items-center gap-3
                                    px-4 py-3 rounded-xl
                                    transition-all duration-200
                                    ${isActive
                                        ? "bg-green-800"
                                        : "hover:bg-green-700"
                                    }
                                    `
                                }
                            >
                                <FaUserTie size={20} />

                                {openSidebar && (
                                    <span>Employee</span>
                                )}
                            </NavLink>
                        )}
                    </nav>
                    {/* LOGOUT BUTTON */}
                    <button
                        onClick={handleLogout}
                        className="
                            mt-6
                            flex items-center justify-center gap-3
                            w-full
                            px-4 py-3
                            rounded-xl
                            bg-green-800 hover:bg-green-700
                            transition-all duration-200 cursor-pointer
                        "
                    >
                        <FiLogOut size={20} />

                        {openSidebar && (
                            <span>Logout</span>
                        )}
                    </button>
                    <p className="text-center text-sm text-gray-300 mt-4 mb-4">
                        &copy; {new Date().getFullYear()} version 1.0.1
                    </p>
                </div>
            </div>

            {/* PAGE CONTENT */}
            <div
                className={`
                    flex-1 h-screen overflow-y-auto
                    transition-all duration-300
                    ${openSidebar ? "ml-64" : "ml-20"}
                `}
            >
                {children}
            </div>
        </div>
    );
}

export default Sidebar;