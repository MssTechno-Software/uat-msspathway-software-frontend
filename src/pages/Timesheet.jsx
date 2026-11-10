import { useState } from "react";
import Calender from "../container/Calender";
import DailyWorkLog from "../container/DailyWorkLog";
import Guideline from "../container/Guideline";
import Leave from "../container/Leave";
import PublicHoliday from "../container/PublicHoliday";
import PublicHolidayTable from "../container/PublicHolidaysList";
import { getUserRole } from "../services/authSession";

function Timesheet() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateStatus, setDateStatus] = useState(null);

  const handleDateSelect = ({ date, status }) => {
    setSelectedDate(date);
    setDateStatus(status);
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f8fa] overflow-x-hidden">
      {/* MAIN CONTAINER */}
      <div
        className="
          w-full
          max-w-full
          px-2
          sm:px-3
          md:px-4
          lg:px-5
          py-4
          overflow-x-hidden
        "
      >
        {/* LAYOUT */}
        <div
          className="
            flex
            flex-col
            xl:grid
            xl:grid-cols-[380px_minmax(0,1fr)]
            2xl:grid-cols-[420px_minmax(0,1fr)]
            gap-5
            items-start
            w-full
            max-w-full
          "
        >
          {/* LEFT PANEL */}
          <div
            className="
              w-full
              min-w-0
              flex
              flex-col
              gap-5
            "
          >
            <div className="w-full min-w-0">
              <Calender
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>

            {getUserRole() !== "super admin" ? (
              <div className="w-full">
                <Leave />
              </div>
            ) : (
              <div className="w-full">
                <PublicHoliday />
              </div>
            )}

            <div className="w-full">
              <Guideline />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full min-w-0 overflow-hidden">
            {getUserRole() === "super admin" ? (
              <PublicHolidayTable />
            ) : (

              <DailyWorkLog
                selectedDate={selectedDate}
                isLeave={dateStatus === "leave"}
                isPublicHoliday={
                  dateStatus === "publicholiday"
                }
              />

            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Timesheet;