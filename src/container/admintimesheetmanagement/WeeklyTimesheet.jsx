import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import { FiLoader } from "react-icons/fi";
import TimesheetDetailModal from "./TimesheetDetailModal";

/* ============================================================
   API CONFIG
============================================================ */

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://uat-msspathway-software-backend-81057313575.asia-south1.run.app";

const dashboardRequests = new Map();

const dayDetailRequests = new Map();

/* ============================================================
   DATE HELPERS
============================================================ */

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

const addDays = (date, days) => {
    const result = new Date(date);

    result.setDate(
        result.getDate() + days
    );

    return result;
};

const addWeeks = (date, weeks) => {
    return addDays(
        date,
        weeks * 7
    );
};

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

const parseDate = (dateString) => {
    return new Date(
        `${dateString}T00:00:00`
    );
};

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

/* ============================================================
   FORMAT HOURS
============================================================ */

const formatHours = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "0h";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "0h";
    }

    return `${number}h`;
};

/* ============================================================
   FORMAT DATE
============================================================ */

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

/* ============================================================
   FORMAT TIME
============================================================ */

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

/* ============================================================
   AUTH TOKEN
============================================================ */

const getAuthToken = () => {
    return (
        localStorage.getItem(
            "access_token"
        ) ||
        localStorage.getItem(
            "accessToken"
        ) ||
        localStorage.getItem(
            "token"
        ) ||
        localStorage.getItem(
            "authToken"
        ) ||
        ""
    );
};

/* ============================================================
   DEFAULT SUMMARY
============================================================ */

const DEFAULT_SUMMARY = {
    employees_submitted_today: 0,
    total_employees: 0,
    pending_approvals: 0,
    approved_this_week_hours: 0,
    total_hours_logged: 0,
};

/* ============================================================
   WEEKLY TIMESHEET
============================================================ */

function WeeklyTimesheet() {
    /* ==========================================================
       WEEK
    ========================================================== */

    const [weekStart, setWeekStart] =
        useState(() =>
            formatApiDate(
                getMonday(new Date())
            )
        );

    const [weekEnd, setWeekEnd] =
        useState("");

    /* ==========================================================
       API DATA
    ========================================================== */

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

    /* ==========================================================
       UI STATE
    ========================================================== */

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    /* ==========================================================
       DETAIL POPUP STATE
    ========================================================== */

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

    /* ==========================================================
       WEEK DAYS
    ========================================================== */

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

    /* ==========================================================
       FETCH WEEKLY DASHBOARD
    ========================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadWeeklyTimesheet =
            async () => {
                const requestKey =
                    weekStart;

                try {
                    setLoading(true);
                    setError("");

                    const token =
                        getAuthToken();

                    const params =
                        new URLSearchParams();

                    params.set(
                        "period",
                        "week"
                    );

                    params.set(
                        "week_start",
                        weekStart
                    );

                    const requestUrl =
                        `${API_BASE_URL}/timesheet/admin/dashboard?${params.toString()}`;

                    let requestPromise =
                        dashboardRequests.get(
                            requestKey
                        );

                    if (!requestPromise) {
                        const headers = {
                            "Content-Type":
                                "application/json",
                        };

                        if (token) {
                            headers.Authorization =
                                `Bearer ${token}`;
                        }

                        requestPromise =
                            fetch(
                                requestUrl,
                                {
                                    method: "GET",
                                    headers,
                                }
                            )
                                .then(
                                    async (response) => {
                                        if (
                                            !response.ok
                                        ) {
                                            let message =
                                                `Unable to load weekly timesheet (${response.status})`;

                                            try {
                                                const errorData =
                                                    await response.json();

                                                if (
                                                    typeof errorData?.detail ===
                                                    "string"
                                                ) {
                                                    message =
                                                        errorData.detail;
                                                }
                                            } catch {
                                                // ignore
                                            }

                                            throw new Error(
                                                message
                                            );
                                        }

                                        return response.json();
                                    }
                                )
                                .finally(() => {
                                    dashboardRequests.delete(
                                        requestKey
                                    );
                                });

                        dashboardRequests.set(
                            requestKey,
                            requestPromise
                        );
                    }

                    const data =
                        await requestPromise;

                    if (cancelled) {
                        return;
                    }

                    /* WEEK END */

                    setWeekEnd(
                        data?.week_end || ""
                    );

                    /* SUMMARY */

                    const apiSummary =
                        data?.summary || {};

                    setSummary({
                        employees_submitted_today:
                            Number(
                                apiSummary.employees_submitted_today ||
                                0
                            ),

                        total_employees:
                            Number(
                                apiSummary.total_employees ||
                                0
                            ),

                        pending_approvals:
                            Number(
                                apiSummary.pending_approvals ||
                                0
                            ),

                        approved_this_week_hours:
                            Number(
                                apiSummary.approved_this_week_hours ||
                                0
                            ),

                        total_hours_logged:
                            Number(
                                apiSummary.total_hours_logged ||
                                0
                            ),
                    });

                    /* EMPLOYEES */

                    setEmployees(
                        Array.isArray(
                            data?.employees
                        )
                            ? data.employees
                            : []
                    );
                } catch (err) {
                    if (cancelled) {
                        return;
                    }

                    console.error(
                        "Weekly Timesheet API Error:",
                        err
                    );

                    setError(
                        err?.message ||
                        "Unable to load weekly timesheet."
                    );

                    setEmployees([]);

                    setSummary(
                        DEFAULT_SUMMARY
                    );
                } finally {
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            };

        loadWeeklyTimesheet();

        return () => {
            cancelled = true;
        };
    }, [
        weekStart,
    ]);

    /* ============================================================
       PREVIOUS WEEK
    ============================================================ */

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

    /* ============================================================
       NEXT WEEK
    ============================================================ */

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

    /* ============================================================
       CURRENT WEEK
    ============================================================ */

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

    /* ============================================================
       OPEN DAY DETAIL POPUP
    ============================================================ */

    const handleDayClick = async (
        employee,
        day
    ) => {
        if (!day) {
            return;
        }

        const status =
            String(
                day.status || ""
            )
                .toLowerCase()
                .trim();

        /*
          Missing has no day_entry_id.
          Therefore no API call.
        */

        if (!day.id) {
            return;
        }

        /*
          Only actual timesheet entries
          are allowed to open detail.
        */

        const clickableStatuses = [
            "approved",
            "submitted",
            "pending_approval",
            "pending",
            "rejected",
        ];

        if (
            !clickableStatuses.includes(
                status
            )
        ) {
            return;
        }

        setSelectedDay({
            employee,
            day,
        });

        setDayDetails(null);
        setDetailError("");
        setDetailLoading(true);

        try {
            const token =
                getAuthToken();

            const requestKey =
                String(day.id);

            let requestPromise =
                dayDetailRequests.get(
                    requestKey
                );

            if (!requestPromise) {
                const headers = {
                    "Content-Type":
                        "application/json",
                };

                if (token) {
                    headers.Authorization =
                        `Bearer ${token}`;
                }

                requestPromise =
                    fetch(
                        `${API_BASE_URL}/timesheet/admin/timesheet/day/${encodeURIComponent(
                            day.id
                        )}`,
                        {
                            method: "GET",
                            headers,
                        }
                    )
                        .then(
                            async (response) => {
                                if (
                                    !response.ok
                                ) {
                                    let message =
                                        `Unable to load timesheet details (${response.status})`;

                                    try {
                                        const errorData =
                                            await response.json();

                                        if (
                                            typeof errorData?.detail ===
                                            "string"
                                        ) {
                                            message =
                                                errorData.detail;
                                        }
                                    } catch {
                                        // ignore
                                    }

                                    throw new Error(
                                        message
                                    );
                                }

                                return response.json();
                            }
                        )
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

    /* ============================================================
       CLOSE POPUP
    ============================================================ */

    function closeDetailPopup() {
        setSelectedDay(null);
        setDayDetails(null);
        setDetailError("");
        setDetailLoading(false);
    }

    /* ============================================================
       ESCAPE KEY
    ============================================================ */

    useEffect(() => {
        if (!selectedDay) {
            return undefined;
        }

        const handleKeyDown =
            (event) => {
                if (
                    event.key === "Escape"
                ) {
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

    /* ============================================================
       RENDER
    ============================================================ */

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
                className="
          min-h-full
          w-full
          bg-white
          px-9
          py-8
          text-slate-900
        "
            >

                {/* ======================================================
                    WEEK NAVIGATION
                ====================================================== */}

                <div
                    className="
            mb-8
            flex
            items-center
            gap-4
          "
                >
                    <button
                        type="button"
                        onClick={
                            handlePreviousWeek
                        }
                        disabled={loading}
                        aria-label="Previous week"
                        className="
              flex
              h-7
              w-7
              items-center
              justify-center
              bg-transparent
              text-[25px]
              leading-none
              text-slate-800
              transition
              hover:text-black
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
                    >
                        ‹
                    </button>

                    <span
                        className="
              text-[15px]
              font-medium
              text-slate-700
            "
                    >
                        {formatWeekRange(
                            weekStart,
                            weekEnd
                        )}
                    </span>

                    <button
                        type="button"
                        onClick={
                            handleNextWeek
                        }
                        disabled={loading}
                        aria-label="Next week"
                        className="
              flex
              h-7
              w-7
              items-center
              justify-center
              bg-transparent
              text-[25px]
              leading-none
              text-slate-800
              transition
              hover:text-black
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
                    >
                        ›
                    </button>
                </div>

                {/* ======================================================
                    SUMMARY CARDS
                ====================================================== */}

                <div
                    className="
            mb-10
            grid
            w-full
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
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

                {/* ======================================================
                    ERROR
                ====================================================== */}

                {error && (
                    <div
                        className="
              mb-5
              rounded-[4px]
              border
              border-[#ead2d2]
              bg-[#fffafa]
              px-4
              py-3
              text-[11px]
              text-[#8b2d2d]
            "
                    >
                        {error}
                    </div>
                )}

                {/* ======================================================
                    TABLE
                ====================================================== */}

                <div
                    className="
            relative
            w-full
            overflow-x-auto
            overflow-y-auto
            border
            border-[#e5d8d2]
            bg-white
          "
                >
                    <table
                        className="
              w-full
              min-w-[900px]
              table-fixed
              border-collapse
            "
                    >
                        {/* ==================================================
                            HEADER
                        ================================================== */}

                        <thead
                            className="
                sticky
                top-0
                z-10
              "
                        >
                            <tr
                                className="
                  h-[62px]
                  bg-[#eef3fd]
                "
                            >
                                <th
                                    className="
                    w-[220px]
                    border-b
                    border-[#d9dce4]
                    px-5
                    text-left
                    text-[10px]
                    font-semibold
                    tracking-[0.3px]
                    text-[#17243b]
                  "
                                >
                                    EMPLOYEE
                                </th>

                                {weekDays.map(
                                    (day) => (
                                        <th
                                            key={
                                                day.key
                                            }
                                            className="
                         border-b
                         border-[#d9dce4]
                         px-3
                         text-center
                         text-[10px]
                         font-semibold
                         tracking-[0.3px]
                         text-[#17243b]
                      "
                                        >
                                            <div>
                                                {
                                                    day.label
                                                }
                                            </div>

                                            <div
                                                className="
                          mt-1
                          text-[9px]
                          font-medium
                          text-slate-500
                        "
                                            >
                                                {
                                                    day.dateNumber
                                                }
                                            </div>
                                        </th>
                                    )
                                )}

                                <th
                                    className="
                    w-[100px]
                    border-b
                    border-[#d9dce4]
                    px-3
                    text-center
                    text-[10px]
                    font-semibold
                    tracking-[0.3px]
                    text-[#17243b]
                  "
                                >
                                    WEEKLY
                                    <br />
                                    TOTAL
                                </th>
                            </tr>
                        </thead>

                        {/* ==================================================
                            BODY
                        ================================================== */}

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
                                        className="
                      h-[150px]
                      border-b
                      border-[#e5d8d2]
                      text-center
                      text-[13px]
                      text-slate-400
                    "
                                    >
                                        No employees found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ======================================================
                    FOOTER
                ====================================================== */}

                <div
                    className="
            flex
            flex-col
            items-center
            pt-5
          "
                >
                    <div
                        className="
              mb-4
              flex
              gap-1.5
            "
                    >
                        <span
                            className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#aaa]
              "
                        />

                        <span
                            className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#aaa]
              "
                        />

                        <span
                            className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#aaa]
              "
                        />
                    </div>

                    <span
                        className="
              text-[9px]
              text-[#a8a8a8]
            "
                    >
                        Scrolling through
                        100+ employees...
                    </span>

                    <button
                        type="button"
                        onClick={
                            handleCurrentWeek
                        }
                        disabled={loading}
                        className="
              mt-5
              rounded-[4px]
              border
              border-[#ded4cf]
              bg-white
              px-4
              py-2
              text-[10px]
              font-medium
              text-[#3d332f]
              transition
              hover:bg-[#f8f6f2]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                    >
                        Current Week
                    </button>
                </div>
            </div>

            {/* ========================================================
                DAY DETAIL POPUP
            ======================================================== */}

            {selectedDay && (
                <TimesheetDetailModal
                    selectedDay={selectedDay}
                    details={dayDetails}
                    loading={detailLoading}
                    error={detailError}
                    onClose={closeDetailPopup}
                    API_BASE_URL={API_BASE_URL}
                    formatHours={formatHours}
                    formatDetailDate={formatDetailDate}
                    formatTime={formatTime}
                />
            )}
        </>
    );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
    icon,
    title,
    value,
    live = false,
}) {
    return (
        <div
            className="
        relative
        flex
        min-h-[125px]
        w-full
        flex-col
        justify-between
        rounded-[4px]
        border
        border-[#e5d8d2]
        bg-white
        px-5
        py-4
      "
        >
            <div
                className="
          flex
          h-7
          w-7
          items-center
          justify-center
          bg-[#f1f5fb]
          text-[14px]
          text-slate-800
        "
            >
                {icon}
            </div>

            <div className="relative">
                {live && (
                    <span
                        className="
              absolute
              bottom-9
              right-0
              text-[10px]
              font-bold
              text-[#3b8a57]
            "
                    >
                        LIVE
                    </span>
                )}

                <div
                    className="
             mb-1.5
             text-[10px]
             font-semibold
             tracking-[0.2px]
             text-slate-600
          "
                >
                    {title}
                </div>

                <div
                    className="
             text-[21px]
             font-semibold
             text-[#0b1b35]
          "
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   EMPLOYEE ROW
============================================================ */

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
            className="
        h-[70px]
        transition-colors
        hover:bg-[#fcfcfd]
      "
        >
            {/* EMPLOYEE */}

            <td
                className="
          border-b
          border-[#e5d8d2]
          px-5
        "
            >
                <div
                    className="
            flex
            items-center
            gap-3
          "
                >
                    {employee.avatar_url ? (
                        <img
                            src={`${API_BASE_URL}${employee.avatar_url}`}
                            alt=""
                            className="
                h-7
                w-7
                flex-shrink-0
                rounded-full
                object-cover
              "
                            onError={(
                                event
                            ) => {
                                event.currentTarget.style.display =
                                    "none";
                            }}
                        />
                    ) : (
                        <div
                            className="
      flex
      h-7
      w-7
      flex-shrink-0
      items-center
      justify-center
      rounded-full
      bg-[#f1f5f9]
      text-[10px]
      font-semibold
      uppercase
      text-[#002B5B]
    "
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
                            className="
                whitespace-nowrap
                text-[12px]
                font-semibold
                text-[#17243b]
              "
                        >
                            {
                                employee.employee_name
                            }
                        </div>

                        <div
                            className="
                mt-1
                text-[9px]
                text-[#7b8492]
              "
                        >
                            {
                                employee.employee_code
                            }
                        </div>
                    </div>
                </div>
            </td>

            {/* DAYS */}

            {dayKeys.map(
                (dayKey) => {
                    const day =
                        employee.days?.[
                            dayKey
                        ];

                    return (
                        <td
                            key={dayKey}
                            className="
                border-b
                border-[#e5d8d2]
                px-3
                text-center
              "
                        >
                            <TimesheetCell
                                day={day}
                                employee={
                                    employee
                                }
                                onClick={
                                    onDayClick
                                }
                            />
                        </td>
                    );
                }
            )}

            {/* WEEKLY TOTAL */}

            <td
                className="
          border-b
          border-[#e5d8d2]
          px-3
          text-center
          text-[13px]
          font-bold
          text-[#0b1b35]
        "
            >
                {formatHours(
                    employee.weekly_total
                )}
            </td>
        </tr>
    );
}

/* ============================================================
   TIMESHEET CELL
============================================================ */

function TimesheetCell({
    day,
    employee,
    onClick,
}) {
    if (!day) {
        return (
            <Cell
                className="
          border-[#d8dce4]
          bg-[#f5f6f8]
          text-[#7a8290]
        "
            >
                --
            </Cell>
        );
    }

    const status =
        String(
            day.status || ""
        )
            .toLowerCase()
            .trim();

    const hasEntry =
        Boolean(day.id);

    const canOpen =
        hasEntry &&
        [
            "approved",
            "submitted",
            "pending_approval",
            "pending",
            "rejected",
        ].includes(status);

    /* ==========================================================
       APPROVED
       GREEN
    ========================================================== */

    if (
        status === "approved" &&
        day.hours !== null &&
        day.hours !== undefined
    ) {
        return (
            <Cell
                clickable={canOpen}
                onClick={() =>
                    onClick(employee, day)
                }
                className="
          border-[#78a66f]
          bg-[#f2faef]
          text-[#28612d]
        "
            >
                {formatHours(
                    day.hours
                )}
            </Cell>
        );
    }

    /* ==========================================================
       SUBMITTED / PENDING APPROVAL
       YELLOW

       Backend currently sends:
       status: "submitted"

       So submitted MUST be yellow.
    ========================================================== */

    if (
        status === "submitted" ||
        status === "pending_approval" ||
        status === "pending"
    ) {
        return (
            <Cell
                clickable={canOpen}
                onClick={() =>
                    onClick(employee, day)
                }
                className="
          border-[#e5b900]
          bg-[#fff8d9]
          text-[#885900]
        "
            >
                {day.hours !== null &&
                    day.hours !== undefined
                    ? formatHours(
                        day.hours
                    )
                    : "PENDING"}
            </Cell>
        );
    }

    /* ==========================================================
       REJECTED
       RED
    ========================================================== */

    if (
        status === "rejected"
    ) {
        return (
            <Cell
                clickable={canOpen}
                onClick={() =>
                    onClick(employee, day)
                }
                className="
          border-[#ef5555]
          bg-[#ffe8e8]
          text-[#c52222]
        "
            >
                {day.hours !== null &&
                    day.hours !== undefined
                    ? formatHours(
                        day.hours
                    )
                    : "REJECTED"}
            </Cell>
        );
    }

    /* ==========================================================
       LEAVE
       PINK
    ========================================================== */

    if (
        status === "leave" ||
        status === "on_leave"
    ) {
        return (
            <Cell
                small
                className="
          border-[#f47ab8]
          bg-[#fff0f7]
          text-[#bd216d]
        "
            >
                {day.leave_type ||
                    "LEAVE"}
            </Cell>
        );
    }

    /* ==========================================================
       HOLIDAY
       BLUE
    ========================================================== */

    if (
        status === "holiday" ||
        status ===
        "public_holiday" ||
        status ===
        "publicholiday"
    ) {
        return (
            <Cell
                small
                className="
          border-[#4f8fff]
          bg-[#e3edff]
          text-[#1453c4]
        "
            >
                HOLIDAY
            </Cell>
        );
    }

    /* ==========================================================
       MISSING
       GRAY
    ========================================================== */

    if (
        status === "missing"
    ) {
        return (
            <Cell
                className="
          border-[#d8dce4]
          bg-[#f5f6f8]
          text-[#7a8290]
        "
            >
                --
            </Cell>
        );
    }

    /* ==========================================================
       FALLBACK
    ========================================================== */

    return (
        <Cell
            clickable={canOpen}
            onClick={() =>
                canOpen &&
                onClick(
                    employee,
                    day
                )
            }
            className="
        border-[#d8dce4]
        bg-[#f5f6f8]
        text-[#7a8290]
      "
        >
            {day.hours !== null &&
                day.hours !== undefined
                ? formatHours(
                    day.hours
                )
                : "--"}
        </Cell>
    );
}

/* ============================================================
   CELL
============================================================ */

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
            className={`
        mx-auto
        flex
        h-[39px]
        w-[76px]
        items-center
        justify-center
        rounded-[4px]
        border
        text-center
        transition-all

        ${clickable
                    ? "cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_3px_8px_rgba(15,23,42,0.10)] active:translate-y-0"
                    : ""
                }

        ${small
                    ? "px-1 text-[9px] font-bold"
                    : "text-[11px] font-medium"
                }

        ${className}
      `}
        >
            {children}
        </div>
    );
}

/* ============================================================
   LOADING ROWS
============================================================ */

function LoadingRows() {
    return (
        <>
            {[1, 2, 3].map(
                (row) => (
                    <tr
                        key={row}
                        className="
              h-[70px]
            "
                    >
                        {/* EMPLOYEE */}

                        <td
                            className="
                border-b
                border-[#e5d8d2]
                px-5
              "
                        >
                            <div
                                className="
                  h-5
                  w-32
                  animate-pulse
                  rounded
                  bg-slate-100
                "
                            />
                        </td>

                        {/* DAYS */}

                        {[1, 2, 3, 4, 5].map(
                            (item) => (
                                <td
                                    key={item}
                                    className="
                    border-b
                    border-[#e5d8d2]
                    px-3
                  "
                                >
                                    <div
                                        className="
                      mx-auto
                      h-[39px]
                      w-[76px]
                      animate-pulse
                      rounded-[4px]
                      bg-slate-100
                    "
                                    />
                                </td>
                            )
                        )}

                        {/* TOTAL */}

                        <td
                            className="
                border-b
                border-[#e5d8d2]
                px-3
              "
                        >
                            <div
                                className="
                  mx-auto
                  h-5
                  w-10
                  animate-pulse
                  rounded
                  bg-slate-100
                "
                            />
                        </td>
                    </tr>
                )
            )}
        </>
    );
}

export default WeeklyTimesheet;