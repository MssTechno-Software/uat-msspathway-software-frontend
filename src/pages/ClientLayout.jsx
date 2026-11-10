import {
  useParams,
  useNavigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  FiFileText,
  FiKey,
  FiBarChart2,
  FiUser,
  FiGrid,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";

import { useState, useEffect } from "react";
import { getUserRole } from "../services/authSession";

function ClientLayout() {
  const { client_id } = useParams();
  const [openSidebar, setOpenSidebar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = getUserRole();
  const isActive = (path) => location.pathname.includes(path);

  const clientName =
    location.state?.clientName ||
    localStorage.getItem(`clientName_${client_id}`) ||
    "";

  useEffect(() => {
    if (location.state?.clientName) {
      localStorage.setItem(
        `clientName_${client_id}`,
        location.state.clientName
      );
    }
  }, [location.state?.clientName, client_id]);

  const handleBack = () => {
    navigate(
      role === "employee"
        ? "/employee-dashboard/clients"
        : "/dashboard/clients"
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <div
        className={`
          fixed
          top-0
          left-0
          h-screen
          z-40
          bg-[#301E0F]
          text-white
          flex flex-col justify-between
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
          aria-label={openSidebar ? "Collapse sidebar" : "Expand sidebar"}
        >
          {openSidebar ? (
            <FiChevronLeft size={20} />
          ) : (
            <FiChevronRight size={20} />
          )}
        </button>

        <div>
          {/* HEADER */}
          <div className="px-4 py-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              {/* BACK BUTTON */}
              <button
                onClick={handleBack}
                className="
                  flex items-center justify-center
                  w-10 h-10
                  cursor-pointer hover:text-gray-300
                  transition-all duration-200
                "
                aria-label="Back to clients"
              >
                <FiArrowLeft size={20} />
              </button>

              {openSidebar && (
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold truncate">
                    {clientName}
                  </h1>
                  <p className="text-md text-gray-300">Client Dashboard</p>
                </div>
              )}
            </div>
          </div>

          {/* MENU */}
          <div className="mt-4 space-y-1">
            {/* CLIENT PROFILE */}
            <div
              onClick={() => navigate(`/clients/${client_id}`)}
              className={`
                flex items-center gap-3 px-6 py-3 cursor-pointer
                ${!location.pathname.includes("applications") &&
                  !location.pathname.includes("credentials") &&
                  !location.pathname.includes("reports") &&
                  !location.pathname.includes("schedule-interview") &&
                  !location.pathname.includes("overview")
                  ? "border-l-4 border-green-800 bg-white/10"
                  : "hover:bg-white/10"
                }
              `}
            >
              <FiUser size={20} />
              {openSidebar && <span>Client Profile</span>}
            </div>

            {/* APPLICATIONS */}
            <div
              onClick={() =>
                navigate(`/clients/${client_id}/applications`, {
                  state: { clientName },
                })
              }
              className={`
                flex items-center gap-3 px-6 py-3 cursor-pointer
                ${isActive("applications")
                  ? "border-l-4 border-green-800 bg-white/10"
                  : "hover:bg-white/10"
                }
              `}
            >
              <FiFileText size={20} />
              {openSidebar && <span>Applications</span>}
            </div>

            {/* CREDENTIALS */}
            <div
              onClick={() =>
                navigate(`/clients/${client_id}/credentials`, {
                  state: { clientName },
                })
              }
              className={`
                flex items-center gap-3 px-6 py-3 cursor-pointer
                ${isActive("credentials")
                  ? "border-l-4 border-green-800 bg-white/10"
                  : "hover:bg-white/10"
                }
              `}
            >
              <FiKey size={20} />
              {openSidebar && <span>Credentials</span>}
            </div>

            {/* REPORTS */}
            <div
              onClick={() =>
                navigate(`/clients/${client_id}/reports`, {
                  state: { clientName },
                })
              }
              className={`
                flex items-center gap-3 px-6 py-3 cursor-pointer
                ${isActive("reports")
                  ? "border-l-4 border-green-800 bg-white/10"
                  : "hover:bg-white/10"
                }
              `}
            >
              <FiBarChart2 size={20} />
              {openSidebar && <span>Reports</span>}
            </div>

            {/* SCHEDULE INTERVIEW */}
            <div
              onClick={() =>
                navigate(`/clients/${client_id}/schedule-interview`, {
                  state: { clientName },
                })
              }
              className={`
                flex items-center gap-3 px-6 py-3 cursor-pointer
                ${isActive("schedule-interview")
                  ? "border-l-4 border-green-800 bg-white/10"
                  : "hover:bg-white/10"
                }
              `}
            >
              <FiCalendar size={20} />
              {openSidebar && <span>Schedule Interview</span>}
            </div>

            {/* OVERVIEW */}
            <div
              onClick={() =>
                navigate(`/clients/${client_id}/overview`, {
                  state: { clientName },
                })
              }
              className={`
                flex items-center gap-3 px-6 py-3 cursor-pointer
                ${isActive("overview")
                  ? "border-l-4 border-green-800 bg-white/10"
                  : "hover:bg-white/10"
                }
              `}
            >
              <FiGrid size={20} />
              {openSidebar && <span>Overview</span>}
            </div>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div
        className={`
          flex-1
          h-screen
          overflow-y-auto
          p-6
          transition-all duration-300
          w-[calc(100%-16rem)]
          ${openSidebar ? "ml-64" : "ml-20 w-[calc(100%-5rem)]"}
        `}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default ClientLayout;
