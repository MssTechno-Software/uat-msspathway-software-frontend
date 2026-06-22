import { ChevronLeft, ChevronRight } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function Calender({ selectedDate, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [hoursMap, setHoursMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth(); //0-11
  const month = monthIndex + 1; //1-12

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);
  /*Fetch calendar data on month/year change */
  useEffect(() => {
    fetchCalendarData();
  }, [month, year]);

  useEffect(() => {
    const refreshCalendar = () => {
      fetchCalendarData();
    };

    window.addEventListener("timesheetSubmitted", refreshCalendar);

    return () => {
      window.removeEventListener("timesheetSubmitted", refreshCalendar);
    };
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);

      console.log("Calling API with:", month, year);

      const response = await fetch(
        `https://timesheet-api-790373899641.asia-south1.run.app/calendar/date-range?month=${month}&year=${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization if required
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Calendar API Response:", data);
      /* Convert API object into simple hours map */
      const formattedMap = {};
      const calendarData = data.date || {};
      console.log("Calendar Data:", calendarData);
      Object.entries(calendarData).forEach(([key, entry]) => {
        if (!entry) return;

        if (entry.status === "leave") {
          formattedMap[key] = "leave";
        } else if (entry.status === "pending") {
          formattedMap[key] = "pending";
        } else if (
          entry.status === "publicholiday" ||
          entry.status === "public_holiday" ||
          entry.status === "public holiday"
        ) {
          formattedMap[key] = "publicholiday";
        } else {
          formattedMap[key] = entry.hours || 0;
        }
      });
      setHoursMap(formattedMap);
    }

    catch (error) {
      console.error("Error fetching calendar data:", error);
    }

    finally {
      setLoading(false);
    }
  };

  const firstDay = new Date(year, monthIndex, 1);
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, monthIndex - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1));

  const dateKey = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isSameDay = (d1, d2) =>
    d1 && d2 && d1.toDateString() === d2.toDateString();

  const isWeekend = (date) =>
    date.getDay() === 0 || date.getDay() === 6;

  /* Weekly progress */
  const getWeekHours = () => {
    if (!selectedDate) return 0;

    const start = new Date(selectedDate);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      if (isWeekend(d)) continue;

      const val = hoursMap[dateKey(d)];
      if (val === "leave") continue;

      const h = parseFloat(val);
      if (!isNaN(h)) total += h;
    }
    return total;
  };

  const weeklyHours = getWeekHours();
  const weeklyTarget = 40;
  const progressPercent = Math.min(
    (weeklyHours / weeklyTarget) * 100,
    100
  );

  return (
    <>
      {(loading || pageLoading) && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">

          <div className="p-6 flex flex-col items-center gap-3">

            <FiLoader className="animate-spin text-4xl text-green-800" />

            <p className="text-gray-700 font-medium">
              Please wait...
            </p>

          </div>
        </div>
      )}
      <div
        className="
          w-full
          bg-white
          rounded-2xl
          border
          border-gray-100
          shadow-sm
          p-3
          sm:p-4
          md:p-5
          xl:p-6
          overflow-hidden
        "
      >

        {/* Header */}
        <div className="flex justify-between items-center mb-4 relative">

          {/* Month + Year */}
          <div className="flex items-center gap-2">

            {/* Month Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
                className="font-semibold text-base sm:text-lg xl:text-xl"
              >
                {months[monthIndex]}
              </button>

              {showMonthDropdown && (
                <div className="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-28 max-h-60 overflow-y-auto">
                  {months.map((m, index) => (
                    <div
                      key={m}
                      onClick={() => {
                        setCurrentDate(new Date(year, index, 1));
                        setShowMonthDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
                className="font-semibold text-base sm:text-lg xl:text-xl"
              >
                {year}
              </button>

              {showYearDropdown && (
                <div className="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-28 max-h-60 overflow-y-auto">
                  {years.map((y) => (
                    <div
                      key={y}
                      onClick={() => {
                        setCurrentDate(new Date(y, monthIndex, 1));
                        setShowYearDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {y}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>

            <button onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div
          className="
            grid
            grid-cols-7
            gap-1
            text-[8px]
            sm:text-[10px]
            md:text-xs
            text-gray-400
            text-center
            mb-2
          "
        >
          {weekDays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Dates */}
        <div className="grid grid-cols-7 min-w-0 gap-1 sm:gap-2 md:gap-2.5 text-center"
        >
          {[...Array(startDay)].map((_, i) => (
            <div key={i} />
          ))}

          {[...Array(lastDate)].map((_, i) => {
            const date = new Date(year, monthIndex, i + 1);
            const key = dateKey(date);
            const weekend = isWeekend(date);
            const value = hoursMap[key];
            const selected = isSameDay(date, selectedDate);

            let bg = "bg-white border-gray-200";
            let label = "0h";

            if (weekend) {
              bg = "bg-gray-100 border-gray-400 text-gray-400";
            }
            else if (value === "leave") {
              bg = "bg-red-50 border-red-200 text-red-600";
              label = "leave";
            }
            else if (value === "pending") {
              bg = "bg-gray-100 border-gray-400 text-gray-400";
              label = "pending";
            }
            else if (value === "publicholiday") {
              bg = "bg-blue-100 border-blue-300 text-blue-700";
              label = "public hol";
            }
            else if (Number(value) >= 8) {
              bg = "bg-green-50 border-green-200 text-green-700";
              label = `${value}h`;
            }
            else if (Number(value) > 0) {
              bg = "bg-yellow-50 border-yellow-200 text-yellow-700";
              label = `${value}h`;
            }

            return (
              <div
                key={i}
                onClick={() =>
                  onDateSelect({
                    date,
                    status: value
                  })
                }
                className={`flex flex-col items-center justify-center h-11 sm:h-13.5 md:h-15.5 lg:h-17 w-full min-w-0 rounded-lg border text-[10px] sm:text-xs md:text-sm leading-none transition-all duration-200
                  ${bg}
                  ${selected ? "ring-2 ring-green-600" : ""}
                  ${weekend
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-100"
                  }
                `}
              >
                {i + 1}
                <div
                  className="
                    text-[7px]
                    sm:text-[8px]
                    md:text-[9px]
                    mt-0.5
                    sm:mt-1
                    font-medium
                    truncate
                    max-w-full
                  "
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Legend */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-2
            sm:gap-3
            text-[11px]
            sm:text-xs
            text-gray-600
          "
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-100 border"></span>
            Filled
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-100 border"></span>
            Partially Filled
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-white border"></span>
            Not Filled
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-100 border"></span>
            Leave
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-100 border"></span>
            Public Holiday
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Weekly Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">
              Weekly Progress
            </p>
            <p className="text-sm font-semibold">
              {weeklyHours.toFixed(1)} / {weeklyTarget}h
            </p>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-green-700 h-2 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-gray-400 mt-2">
            You need {(weeklyTarget - weeklyHours).toFixed(1)} more hours
            to reach your weekly target.
          </p>
        </div>

        <hr className="my-3 border-gray-200" />

        {role !== "super admin" ? (
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("leave-event", {
                  detail: "open-leave-modal",
                })
              )
            }
            className="
              w-full
              mt-4
              bg-green-800
              text-white
              text-sm
              sm:text-base
              font-medium
              shadow-sm
              py-2.5
              sm:py-3
              rounded-xl
              hover:bg-green-700
              transition-all
            "
          >
            Apply for Leave
          </button>
        ) : (
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("holiday-event", {
                  detail: "open-holiday-modal",
                })
              )
            }
            className="
              w-full
              mt-4
              bg-green-800
              text-white
              text-sm
              sm:text-base
              font-medium
              shadow-sm
              py-2.5
              sm:py-3
              rounded-xl
              hover:bg-green-700
              transition-all
            "
          >
            Add Public Holiday
          </button>
        )}

        <button
          onClick={() =>
            navigate(
              role === "employee"
                ? "/employee-dashboard/leave-requests"
                : "/dashboard/leave-requests"
            )
          }
          className="
            w-full
            mt-4
            bg-green-800
            text-white
            text-sm
            sm:text-base
            font-medium
            shadow-sm
            py-2.5
            sm:py-3
            rounded-xl
            hover:bg-green-700
            transition-all
          "
        >
          Leave Requests
        </button>
      </div>
    </>
  );
}
export default Calender;