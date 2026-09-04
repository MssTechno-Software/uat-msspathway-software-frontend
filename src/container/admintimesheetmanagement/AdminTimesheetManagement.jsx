import React, { useState } from "react";
import WeeklyTimesheet from "./WeeklyTimesheet";
import MonthlyTimesheet from "./MonthlyTimesheet";

function AdminTimesheetManagement() {
  const [view, setView] = useState("weekly");

  return (
    <div className="w-full h-full">

      {/* HEADER + VIEW SWITCH */}
      <div className="px-10 pt-6">

        <h1 className="text-3xl font-bold text-[#002B5B]">
          Timesheet Management
        </h1>

        {/* WEEKLY / MONTHLY */}
        <div className="mt-6 inline-flex rounded-md bg-[#F1F4FA] p-1">

          {/* WEEKLY */}
          <button
            type="button"
            onClick={() => setView("weekly")}
            className={`
              rounded-md
              px-5
              py-2.5
              text-sm
              font-semibold
              transition-all
              duration-200
              ${
                view === "weekly"
                  ? "bg-white text-[#002B5B] shadow-sm"
                  : "bg-transparent text-[#475569] hover:text-[#002B5B]"
              }
            `}
          >
            Weekly View
          </button>

          {/* MONTHLY */}
          <button
            type="button"
            onClick={() => setView("monthly")}
            className={`
              rounded-md
              px-5
              py-2.5
              text-sm
              font-semibold
              transition-all
              duration-200
              ${
                view === "monthly"
                  ? "bg-white text-[#002B5B] shadow-sm"
                  : "bg-transparent text-[#475569] hover:text-[#002B5B]"
              }
            `}
          >
            Monthly View
          </button>

        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full min-w-0">

        {/* WEEKLY VIEW */}
        {view === "weekly" && (
          <WeeklyTimesheet />
        )}

        {/* MONTHLY VIEW */}
        {view === "monthly" && (
          <MonthlyTimesheet />
        )}

      </div>

    </div>
  );
}

export default AdminTimesheetManagement;