import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { FiLoader } from "react-icons/fi";
import TimesheetDetailModal from "./TimesheetDetailModal";
import api from "../../api/axios";

const dashboardRequests = new Map();

const dayDetailRequests = new Map();

// Get the Monday for the selected date.
const getMonday = (date) => {
    const result = new Date(date);

    const day = result.getDay();

    const difference =
        day === 0 ? -6 : 1 - day;

    result.setDate(
        result.getDate() + difference
    );

    result.setHours(0, 0, 0, 0);

    return result;
};

// Add days without mutating the source date.
const addDays = (date, days) => {
    const result = new Date(date);

    result.setDate(
        result.getDate() + days
    );

    return result;
};

// Move the selected date by full weeks.
const addWeeks = (date, weeks) => {
    return addDays(
        date,
        weeks * 7
    );
};

// Format dates for API requests.
const formatApiDate = (date) => {
    const year =
        date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Parse an API date in local time.
const parseDate = (dateString) => {
    return new Date(
        `${dateString}T00:00:00`
    );
};

// Format the visible weekly date range.
const formatWeekRange = (
    weekStart,
    weekEnd
) => {
    if (!weekStart) {
        return "";
    }

    const start =
        parseDate(weekStart);

    const end = weekEnd
        ? parseDate(weekEnd)
        : addDays(start, 4);

    const startMonth =
        start.toLocaleDateString(
            "en-US",
            {
                month: "long",
            }
        );

    const endMonth =
        end.toLocaleDateString(
            "en-US",
            {
                month: "long",
            }
        );

    const startYear =
        start.getFullYear();

    const endYear =
        end.getFullYear();

    if (
        startMonth === endMonth &&
        startYear === endYear
    ) {
        return `${startMonth} ${start.getDate()} — ${end.getDate()}, ${startYear}`;
    }

    if (startYear === endYear) {
        return `${startMonth} ${start.getDate()} — ${endMonth} ${end.getDate()}, ${startYear}`;
    }

    return `${startMonth} ${start.getDate()}, ${startYear} — ${endMonth} ${end.getDate()}, ${endYear}`;
};
// Format numeric hours for display.
const formatHours = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "0h";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0h";
    }

    const rounded = Math.round(
        (number + Number.EPSILON) * 100
    ) / 100;

    return `${rounded}h`;
};
// Format a detail-view date.
const formatDetailDate = (value) => {
    if (!value) {
        return "--";
    }

    const date = new Date(
        `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

// Convert a 24-hour time value to readable time.
const formatTime = (value) => {
    if (!value) {
        return "--";
    }

    const parts = String(value).split(":");

    if (parts.length < 2) {
        return value;
    }

    let hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
        return value;
    }

    const period =
        hours >= 12 ? "PM" : "AM";

    hours =
        hours % 12 || 12;

    return `${String(hours).padStart(
        2,
        "0"
    )}:${minutes} ${period}`;
};

// Set safe initial values for dashboard summary cards.
const DEFAULT_SUMMARY = {
    employees_submitted_today: 0,
    total_employees: 0,
    pending_approvals: 0,
    approved_this_week_hours: 0,
    total_hours_logged: 0,
};

// Render the weekly admin timesheet dashboard.
function WeeklyTimesheet() {
    const [weekStart, setWeekStart] =
        useState(() =>
            formatApiDate(
                getMonday(new Date())
            )
        );

    const [weekEnd, setWeekEnd] =
        useState("");
    const [
        employees,
        setEmployees,
    ] = useState([]);

    const [
        summary,
        setSummary,
    ] = useState(
        DEFAULT_SUMMARY
    );
    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");
    const [
        selectedDay,
        setSelectedDay,
    ] = useState(null);

    const [
        dayDetails,
        setDayDetails,
    ] = useState(null);

    const [
        detailLoading,
        setDetailLoading,
    ] = useState(false);

    const [
        detailError,
        setDetailError,
    ] = useState("");

    // Build Monday-to-Friday cells for the selected week.
    const weekDays = useMemo(() => {
        const start =
            parseDate(weekStart);

        const keys = [
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
        ];

        return keys.map(
            (key, index) => {
                const date =
                    addDays(start, index);

                return {
                    key,
                    date,
                    label:
                        date.toLocaleDateString(
                            "en-US",
                            {
                                weekday: "short",
                            }
                        ).toUpperCase(),
                    dateNumber:
                        date.getDate(),
                };
            }
        );
    }, [weekStart]);
      // Fetch the selected week directly from the backend.
    const loadWeeklyTimesheet = useCallback(async () => {
        let cancelled = false;

        try {
            setLoading(true);
            setError("");

            // API: GET weekly admin timesheet dashboard
            // Purpose: Reload employees, summary, and weekly timesheet data
            const requestKey = weekStart;
            let requestPromise = dashboardRequests.get(requestKey);

            if (!requestPromise) {
                requestPromise = api
                    .get("/timesheet/admin/dashboard", {
                        params: {
                            period: "week",
                            week_start: weekStart,
                        },
                    })
                    .then((response) => {
                        if (!response.data) {
                            throw new Error(
                                "Unable to load weekly timesheet."
                            );
                        }

                        return response.data;
                    })
                    .catch((error) => {
                        const message =
                            error?.response?.data?.detail ||
                            `Unable to load weekly timesheet (${error?.response?.status || "unknown"})`;

                        throw new Error(message);
                    })
                    .finally(() => {
                        dashboardRequests.delete(requestKey);
                    });

                dashboardRequests.set(requestKey, requestPromise);
            }

            const data = await requestPromise;

            if (cancelled) {
                return;
            }

            setWeekEnd(data?.week_end || "");

            const apiSummary = data?.summary || {};
            const normalizedSummary = {
                employees_submitted_today: Number(
                    apiSummary.employees_submitted_today || 0
                ),
                total_employees: Number(
                    apiSummary.total_employees || 0
                ),
                pending_approvals: Number(
                    apiSummary.pending_approvals || 0
                ),
                approved_this_week_hours: Number(
                    apiSummary.approved_this_week_hours || 0
                ),
                total_hours_logged: Number(
                    apiSummary.total_hours_logged || 0
                ),
            };

            const loadedEmployees = Array.isArray(data?.employees)
                ? data.employees
                : [];

            // Always use the latest backend response as the source of truth.
            setSummary(normalizedSummary);
            setEmployees(loadedEmployees);
        } catch (err) {
            if (cancelled) {
                return;
            }

            console.error("Weekly Timesheet API Error:", err);

            setError(
                err?.message ||
                "Unable to load weekly timesheet."
            );
            setEmployees([]);
            setSummary(DEFAULT_SUMMARY);
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }

        return () => {
            cancelled = true;
        };
    }, [weekStart]);

    useEffect(() => {
        loadWeeklyTimesheet();
    }, [loadWeeklyTimesheet]);

    // Move to the previous week.
    const handlePreviousWeek =
        () => {
            const currentDate =
                parseDate(weekStart);

            const previousWeek =
                addWeeks(
                    currentDate,
                    -1
                );

            setWeekEnd("");

            setWeekStart(
                formatApiDate(
                    previousWeek
                )
            );

            closeDetailPopup();
        };
    // Move to the next week.
    const handleNextWeek = () => {
        const currentDate =
            parseDate(weekStart);

        const nextWeek =
            addWeeks(
                currentDate,
                1
            );

        setWeekEnd("");

        setWeekStart(
            formatApiDate(nextWeek)
        );

        closeDetailPopup();
    };
    // Return to the current week.
    const handleCurrentWeek =
        () => {
            const monday =
                getMonday(
                    new Date()
                );

            const currentWeek =
                formatApiDate(monday);

            if (
                currentWeek === weekStart
            ) {
                return;
            }

            setWeekEnd("");

            setWeekStart(
                currentWeek
            );

            closeDetailPopup();
        };
    // Open an existing day or a blank editor for an unlogged day.
    const handleDayClick = async (
        employee,
        day,
        dayKey
    ) => {
        // Normalize missing day data before status checks.
        const safeDay = day || {};

        const weekDay = weekDays.find(
            (item) => item.key === dayKey
        );

        const selectedDate =
            safeDay.work_date ||
            safeDay.date ||
            weekDay?.date;

        setSelectedDay({
            employee,
            day: {
                ...safeDay,
                key: dayKey,
                work_date:
                    selectedDate
                        ? formatApiDate(
                            selectedDate instanceof Date
                                ? selectedDate
                                : parseDate(selectedDate)
                        )
                        : "",
            },
        });

        setDayDetails(null);
        setDetailError("");
        setDetailLoading(false);

        // Create local details when no backend entry exists.
        if (!safeDay.id) {
            setDayDetails({
                day_entry_id: null,
                work_date:
                    selectedDate
                        ? formatApiDate(
                            selectedDate instanceof Date
                                ? selectedDate
                                : parseDate(selectedDate)
                        )
                        : "",
                status: "pending",
                notes: "",
                leave_type: "",
                total_hours: 0,
                projects: [],
                activity_descriptions: [],
                rejection_note: "",
                is_unlogged: true,
            });
            return;
        }
        setDetailLoading(true);
        try {
            
            const requestKey =
                String(safeDay.id);


            let requestPromise =
                dayDetailRequests.get(requestKey);

            if (!requestPromise) {
                requestPromise = api
                    .get(
                        `/timesheet/admin/timesheet/day/${encodeURIComponent(
                            safeDay.id
                        )}`
                    )
                    .then((response) => {
                        if (!response.data) {
                            throw new Error(
                                "Unable to load timesheet details."
                            );
                        }

                        return response.data;
                    })
                    .catch((error) => {
                        const message =
                            error?.response?.data?.detail ||
                            `Unable to load timesheet details (${error?.response?.status || "unknown"})`;

                        throw new Error(message);
                    })
                    .finally(() => {
                        dayDetailRequests.delete(
                            requestKey
                        );
                    });

                dayDetailRequests.set(
                    requestKey,
                    requestPromise
                );
            }
            const data =
                await requestPromise;

            setDayDetails(data);
        } catch (err) {
            console.error(
                "Timesheet Day Detail Error:",
                err
            );

            setDetailError(
                err?.message ||
                "Unable to load timesheet details."
            );
        } finally {
            setDetailLoading(false);
        }
    };

    // Reload the selected week after an approval or rejection.
    const handleDayStatusChange = async () => {
        await loadWeeklyTimesheet();
    };

    // Reload the selected week after a successful day save.
    const handleDaySaved = async () => {
        await loadWeeklyTimesheet();
    };

    // Close and reset the detail popup state.
    function closeDetailPopup() {
        setSelectedDay(null);
        setDayDetails(null);
        setDetailError("");
        setDetailLoading(false);
    }

    useEffect(() => {
        if (!selectedDay) {
            return;
        }

        // Close the detail popup with Escape.
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeDetailPopup();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [selectedDay]);

    return (
        <>
            {loading && (
                <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
                    <div className="p-6 flex flex-col items-center gap-3">
                        <FiLoader className="animate-spin text-4xl text-green-700" />

                        <p className="text-gray-700 font-medium">
                            Please wait...
                        </p>
                    </div>
                </div>
            )}

            <div
                className="min-h-full w-full bg-white px-3 py-5 text-slate-900 sm:px-5 sm:py-6 md:px-6 md:py-7 lg:px-8 lg:py-8 xl:px-9"
            >
                <div className="mb-6 flex flex-wrap items-center gap-2 sm:mb-8 sm:gap-4">
                    <button
                        type="button"
                        onClick={handlePreviousWeek}
                        disabled={loading}
                        aria-label="Previous week"
                        className="flex h-7 w-7 shrink-0 items-center justify-center bg-transparent text-[22px] leading-none text-slate-800 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-40 sm:text-[25px]"
                    >
                        ‹
                    </button>

                    <span
                        className="max-w-[calc(100vw-110px)] truncate text-center text-[13px] font-medium text-slate-700 sm:max-w-none sm:text-[15px]"
                    >
                        {formatWeekRange(weekStart, weekEnd)}
                    </span>

                    <button
                        type="button"
                        onClick={handleNextWeek}
                        disabled={loading}
                        aria-label="Next week"
                        className="flex h-7 w-7 shrink-0 items-center justify-center bg-transparent text-[22px] leading-none text-slate-800 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-40 sm:text-[25px]"
                    >
                        ›
                    </button>
                    {weekStart !==
                        formatApiDate(getMonday(new Date())) && (
                            <button
                                type="button"
                                onClick={handleCurrentWeek}
                                disabled={loading}
                                className="rounded-[4px] border border-[#ded4cf] bg-white px-4 py-2 text-[10px] font-medium text-[#3d332f] transition hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                            >
                                Current Week
                            </button>
                        )}
                </div>
                <div
                    className="mb-7 grid w-full grid-cols-1 gap-3 sm:mb-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
                >
                    <SummaryCard
                        icon="☑"
                        title="EMPLOYEES SUBMITTED"
                        value={`${summary.employees_submitted_today} / ${summary.total_employees}`}
                        live
                    />

                    <SummaryCard
                        icon="▣"
                        title="PENDING APPROVALS"
                        value={
                            summary.pending_approvals
                        }
                    />

                    <SummaryCard
                        icon="◉"
                        title="APPROVED THIS WEEK"
                        value={formatHours(
                            summary.approved_this_week_hours
                        )}
                    />

                    <SummaryCard
                        icon="◷"
                        title="TOTAL HOURS LOGGED"
                        value={formatHours(
                            summary.total_hours_logged
                        )}
                    />
                </div>

                {error && (
                    <div
                        className="mb-5 rounded-[4px] border border-[#ead2d2] bg-[#fffafa] px-4 py-3 text-[11px] text-[#8b2d2d]"
                    >
                        {error}
                    </div>
                )}

                <div
                    className="relative w-full overflow-x-auto overflow-y-auto border border-[#e5d8d2] bg-white [-webkit-overflow-scrolling:touch]"
                >
                    <table
                        className="w-full min-w-[760px] table-fixed border-collapse sm:min-w-[900px]"
                    >

                        <thead
                            className="sticky top-0 z-10"
                        >
                            <tr
                                className="h-[54px] bg-[#eef3fd] sm:h-[62px]"
                            >
                                <th
                                    className="w-[180px] border-b border-[#d9dce4] px-3 text-left text-[9px] font-semibold tracking-[0.3px] text-[#17243b] sm:w-[220px] sm:px-5 sm:text-[10px]"
                                >
                                    EMPLOYEE
                                </th>

                                {weekDays.map(
                                    (day) => (
                                        <th
                                            key={
                                                day.key
                                            }
                                            className="border-b border-[#d9dce4] px-2 text-center text-[9px] font-semibold tracking-[0.3px] text-[#17243b] sm:px-3 sm:text-[10px]"
                                        >
                                            <div>
                                                {
                                                    day.label
                                                }
                                            </div>

                                            <div
                                                className="mt-1 text-[9px] font-medium text-slate-500"
                                            >
                                                {
                                                    day.dateNumber
                                                }
                                            </div>
                                        </th>
                                    )
                                )}

                                <th
                                    className="w-[82px] border-b border-[#d9dce4] px-2 text-center text-[9px] font-semibold tracking-[0.3px] text-[#17243b] sm:w-[100px] sm:px-3 sm:text-[10px]"
                                >
                                    WEEKLY
                                    <br />
                                    TOTAL
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <LoadingRows />
                            ) : employees.length >
                                0 ? (
                                employees.map(
                                    (employee) => (
                                        <EmployeeRow
                                            key={
                                                employee.employee_code
                                            }
                                            employee={
                                                employee
                                            }
                                            onDayClick={
                                                handleDayClick
                                            }
                                        />
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="h-[150px] border-b border-[#e5d8d2] text-center text-[13px] text-slate-400"
                                    >
                                        No employees found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {selectedDay && (
                <TimesheetDetailModal
                    key={`${selectedDay?.employee?.employee_code || ""}-${selectedDay?.day?.key || ""}-${selectedDay?.day?.id || "new"}`}
                    selectedDay={selectedDay}
                    details={dayDetails}
                    loading={detailLoading}
                    error={detailError}
                    onClose={closeDetailPopup}
                    onSaved={handleDaySaved}
                    onStatusChange={handleDayStatusChange}
                    formatHours={formatHours}
                    formatDetailDate={formatDetailDate}
                    formatTime={formatTime}
                    isFinalized={selectedDay?.employee?.is_finalized === true}
                />
            )}
        </>
    );
}

// Render one dashboard summary card.
function SummaryCard({
    icon,
    title,
    value,
    live = false,
}) {
    return (
        <div
            className="relative flex min-h-[112px] w-full flex-col justify-between rounded-[4px] border border-[#e5d8d2] bg-white px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(77,139,79,0.16)] sm:min-h-[125px] sm:px-5 sm:py-4"        >
            <div
                className="flex h-7 w-7 items-center justify-center bg-[#f1f5fb] text-[14px] text-slate-800"
            >
                {icon}
            </div>

            <div className="relative">
                {live && (
                    <span
                        className="absolute bottom-9 right-0 text-[10px] font-bold text-[#3b8a57]"
                    >
                        LIVE
                    </span>
                )}

                <div
                    className="mb-1.5 text-[10px] font-semibold tracking-[0.2px] text-slate-600"
                >
                    {title}
                </div>

                <div
                    className="text-[21px] font-semibold text-[#0b1b35]"
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

// Render one employee and their weekday cells.
function EmployeeRow({
    employee,
    onDayClick,
}) {
    const dayKeys = [
        "mon",
        "tue",
        "wed",
        "thu",
        "fri",
    ];

    return (
        <tr
            className="h-[60px] transition-colors hover:bg-[#fcfcfd] sm:h-[70px]"
        >

            <td
                className="border-b border-[#e5d8d2] px-3 sm:px-5"
            >
                <div
                    className="flex items-center gap-2 sm:gap-3"
                >
                    {employee.avatar_url ? (
                        <img
                            src={`${import.meta.env.VITE_API_BASE_URL}${employee.avatar_url}`}
                            alt=""
                            className="h-6 w-6 flex-shrink-0 rounded-full object-cover sm:h-7 sm:w-7"
                            onError={(
                                event
                            ) => {
                                event.currentTarget.style.display =
                                    "none";
                            }}
                        />
                    ) : (
                        <div
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-[9px] font-semibold uppercase text-[#002B5B] sm:h-7 sm:w-7 sm:text-[10px]"
                        >
                            {(employee?.employee_name || "--")
                                .trim()
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((name) =>
                                    name.charAt(0)
                                )
                                .join("")}
                        </div>
                    )}

                    <div>
                        <div
                            className="max-w-[120px] truncate whitespace-nowrap text-[11px] font-semibold text-[#17243b] sm:max-w-none sm:text-[12px]"
                        >
                            {
                                employee.employee_name
                            }
                        </div>

                        <div
                            className="mt-1 text-[8px] text-[#7b8492] sm:text-[9px]"
                        >
                            {
                                employee.employee_code
                            }
                        </div>
                    </div>
                </div>
            </td>

            {dayKeys.map(
                (dayKey) => {
                    const day =
                        employee.days?.[
                        dayKey
                        ];

                    return (
                        <td
                            key={dayKey}
                            className="border-b border-[#e5d8d2] px-2 text-center sm:px-3"
                        >
                            <TimesheetCell
                                day={day}
                                employee={
                                    employee
                                }
                                dayKey={dayKey}
                                onClick={
                                    onDayClick
                                }
                            />
                        </td>
                    );
                }
            )}

            <td
                className="border-b border-[#e5d8d2] px-2 text-center text-[12px] font-bold text-[#0b1b35] sm:px-3 sm:text-[13px]"
            >
                {formatHours(
                    employee.weekly_total
                )}
            </td>
        </tr>
    );
}

// Render a weekday cell based on its current status.
function TimesheetCell({
    day,
    employee,
    dayKey,
    onClick,
}) {
    const safeDay = day || {};

    const status = String(
        day?.status || ""
    )
        .toLowerCase()
        .trim();

    const canOpen = true;

    // LEAVE — check BEFORE !day.id
    if (
        status === "leave" ||
        status === "on_leave"
    ) {
        return (
            <Cell
                small
                clickable={false}
                className="border-[#20a4f3] bg-[#eaf7ff] text-[#008bd2]"
            >
                LEAVE
            </Cell>
        );
    }

    // HOLIDAY — check BEFORE !day.id
    if (
        status === "holiday" ||
        status === "public_holiday" ||
        status === "publicholiday"
    ) {
        return (
            <Cell
                small
                clickable={false}
                className="border-[#a66cff] bg-[#f3edff] text-[#7c3aed]"
            >
                HOLIDAY
            </Cell>
        );
    }

    // UNLOGGED / MISSING
    if (
        !day ||
        status === "missing" ||
        !day.id
    ) {
        return (
            <Cell
                clickable
                onClick={() =>
                    onClick(
                        employee,
                        safeDay,
                        dayKey
                    )
                }
                className="border-[#d8dce4] bg-[#f5f6f8] text-[#7a8290]"
            >
                {safeDay.hours !== null &&
                    safeDay.hours !== undefined &&
                    safeDay.hours !== ""
                    ? formatHours(safeDay.hours)
                    : "--"}
            </Cell>
        );
    }

    // APPROVED
    if (
        status === "approved" &&
        day.hours !== null &&
        day.hours !== undefined
    ) {
        return (
            <Cell
                clickable={canOpen}
                onClick={() =>
                    onClick(
                        employee,
                        day,
                        dayKey
                    )
                }
                className="border-[#78a66f] bg-[#f2faef] text-[#28612d]"
            >
                {formatHours(day.hours)}
            </Cell>
        );
    }

    // SUBMITTED / PENDING
    if (
        status === "submitted" ||
        status === "pending_approval" ||
        status === "pending"
    ) {
        return (
            <Cell
                clickable={canOpen}
                onClick={() =>
                    onClick(
                        employee,
                        day,
                        dayKey
                    )
                }
                className="border-[#e5b900] bg-[#fff8d9] text-[#885900]"
            >
                {day.hours !== null &&
                    day.hours !== undefined
                    ? formatHours(day.hours)
                    : "PENDING"}
            </Cell>
        );
    }

    // REJECTED
    if (status === "rejected") {
        return (
            <Cell
                clickable={canOpen}
                onClick={() =>
                    onClick(
                        employee,
                        day,
                        dayKey
                    )
                }
                className="border-[#ef5555] bg-[#ffe8e8] text-[#c52222]"
            >
                {day.hours !== null &&
                    day.hours !== undefined
                    ? formatHours(day.hours)
                    : "REJECTED"}
            </Cell>
        );
    }

    // DEFAULT
    return (
        <Cell
            clickable={canOpen}
            onClick={() =>
                onClick(
                    employee,
                    day,
                    dayKey
                )
            }
            className="border-[#d8dce4] bg-[#f5f6f8] text-[#7a8290]"
        >
            {day.hours !== null &&
                day.hours !== undefined
                ? formatHours(day.hours)
                : "--"}
        </Cell>
    );
}
// Render a reusable clickable or read-only day cell.
function Cell({
    children,
    className = "",
    small = false,
    clickable = false,
    onClick,
}) {
    return (
        <div
            role={
                clickable
                    ? "button"
                    : undefined
            }
            tabIndex={
                clickable ? 0 : undefined
            }
            onClick={
                clickable
                    ? onClick
                    : undefined
            }
            onKeyDown={
                clickable
                    ? (event) => {
                        if (
                            event.key ===
                            "Enter" ||
                            event.key ===
                            " "
                        ) {
                            event.preventDefault();
                            onClick?.();
                        }
                    }
                    : undefined
            }
            className={`mx-auto flex h-[34px] w-[64px] sm:h-[39px] sm:w-[76px] items-center justify-center rounded-[4px] border text-center transition-all ${clickable ? "cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_3px_8px_rgba(15,23,42,0.10)] active:translate-y-0" : ""} ${small ? "px-1 text-[9px] font-bold" : "text-[11px] font-medium"} ${className} `}
        >
            {children}
        </div>
    );
}

// Render skeleton rows while dashboard data loads.
function LoadingRows() {
    return (
        <>
            {[1, 2, 3].map(
                (row) => (
                    <tr
                        key={row}
                        className="h-[60px] sm:h-[70px]"
                    >

                        <td
                            className="border-b border-[#e5d8d2] px-3 sm:px-5"
                        >
                            <div
                                className="h-5 w-32 animate-pulse rounded bg-slate-100"
                            />
                        </td>

                        {[1, 2, 3, 4, 5].map(
                            (item) => (
                                <td
                                    key={item}
                                    className="border-b border-[#e5d8d2] px-3"
                                >
                                    <div
                                        className="mx-auto h-[34px] w-[64px] animate-pulse rounded-[4px] bg-slate-100 sm:h-[39px] sm:w-[76px]"
                                    />
                                </td>
                            )
                        )}

                        <td
                            className="border-b border-[#e5d8d2] px-3"
                        >
                            <div
                                className="mx-auto h-5 w-9 animate-pulse rounded bg-slate-100 sm:w-10"
                            />
                        </td>
                    </tr>
                )
            )}
        </>
    );
}

export default WeeklyTimesheet;
