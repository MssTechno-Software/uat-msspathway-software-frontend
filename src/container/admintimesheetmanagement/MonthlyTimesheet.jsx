import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import { FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";
import ApiErrorModal from "../ApiErrorModal";
import { getUserRole } from "../../services/authSession";

// Default summary

const DEFAULT_SUMMARY = {
    total_employees: 0,
    total_hours_logged: 0,
    total_leave_days: 0,
    pending_leave_approvals: 0,
    missing_submissions: 0,
};

// Month format helpers

const formatMonth = (date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
};

const parseMonth = (value) => {
    const [year, month] = value
        .split("-")
        .map(Number);

    return new Date(
        year,
        month - 1,
        1
    );
};

const formatMonthLabel = (value) => {
    const date = parseMonth(value);

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric",
        }
    );
};

const changeMonth = (
    month,
    amount
) => {
    const date = parseMonth(month);

    date.setMonth(
        date.getMonth() + amount
    );

    return formatMonth(date);
};

// Monthly timesheet

function MonthlyTimesheet() {
    const navigate = useNavigate();
    // Selected month

    const [month, setMonth] =
        useState(() =>
            formatMonth(new Date())
        );

    // API data

    const [
        employees,
        setEmployees,
    ] = useState([]);

    const [
        summary,
        setSummary,
    ] = useState(DEFAULT_SUMMARY);

    // UI state

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [apiError, setApiError] = useState(null);
    const [reload, setReload] = useState(0);

    // Load monthly timesheet data

    useEffect(() => {
        const controller =
            new AbortController();

        const loadMonthlyTimesheet =
            async () => {
                try {
                    setLoading(true);

                    // Load the selected month’s summary and employee timesheets.
                    const response =
                        await api.get(
                            "/timesheet/admin/dashboard/monthly",
                            {
                                params: {
                                    month,
                                },
                                signal:
                                    controller.signal,
                            }
                        );

                    const data =
                        response.data;

                    // Update summary

                    const apiSummary =
                        data?.summary || {};

                    setSummary({
                        total_employees:
                            Number(
                                apiSummary.total_employees ||
                                0
                            ),

                        total_hours_logged:
                            Number(
                                apiSummary.total_hours_logged ||
                                0
                            ),

                        total_leave_days:
                            Number(
                                apiSummary.total_leave_days ||
                                0
                            ),

                        pending_leave_approvals:
                            Number(
                                apiSummary.pending_leave_approvals ||
                                0
                            ),

                        missing_submissions:
                            Number(
                                apiSummary.missing_submissions ||
                                0
                            ),
                    });

                    // Update employee list

                    setEmployees(
                        Array.isArray(
                            data?.employees
                        )
                            ? data.employees
                            : []
                    );
                } catch (err) {
                    if (
                        controller.signal.aborted
                    ) {
                        return;
                    }

                    if (err?.response?.status === 401 || err?.status === 401) {
                        setApiError(null);
                        window.dispatchEvent(new Event("session-expired"));
                        return;
                    }

                    setApiError({
                        title: "Unable to Load Monthly Timesheet",
                        message: getApiErrorMessage(
                            err,
                            "Unable to load monthly timesheet. Please try again."
                        ),
                        onRetry: () => setReload((current) => current + 1),
                    });

                    setEmployees([]);

                    setSummary(
                        DEFAULT_SUMMARY
                    );
                } finally {
                    if (
                        !controller.signal.aborted
                    ) {
                        setLoading(false);
                    }
                }
            };

        loadMonthlyTimesheet();

        return () => {
            controller.abort();
        };
    }, [month, reload]);

    // Current month button

    const currentMonth = useMemo(
        () => formatMonth(new Date()),
        []
    );

    // Month navigation

    const handlePreviousMonth =
        () => {
            setMonth(
                changeMonth(
                    month,
                    -1
                )
            );
        };

    const handleNextMonth =
        () => {
            setMonth(
                changeMonth(
                    month,
                    1
                )
            );
        };

    const handleCurrentMonth =
        () => {
            setMonth(currentMonth);
        };

    // Status styles
    const getStatusClass = (status) => {
        const normalized = String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "_");

        // Finalized status
        if (normalized === "finalized") {
            return `
            bg-[#4D8B4F]
            text-white
        `;
        }

        // Completed status
        if (normalized === "completed") {
            return `
            bg-[#2563EB]
            text-white
        `;
        }

        if (
            normalized === "action_required" ||
            normalized === "actionrequired"
        ) {
            return `
            bg-[#4b2115]
            text-white
        `;
        }

        return `
        bg-[#eef1f5]
        text-[#536174]
    `;
    };

    // Render monthly timesheet

    return (
        <>
            {apiError && (
                <ApiErrorModal
                    title={apiError.title}
                    message={apiError.message}
                    onRetry={() => {
                        const retry = apiError.onRetry;
                        setApiError(null);
                        retry?.();
                    }}
                    onClose={() => setApiError(null)}
                />
            )}
            {loading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
                    <div className="flex flex-col items-center gap-3 p-6">
                        <FiLoader className="animate-spin text-4xl text-green-700" />

                        <p className="font-medium text-gray-700">
                            Please wait...
                        </p>
                    </div>
                </div>
            )}
            <div
                className="min-h-full w-full min-w-0 bg-transparent px-3 pt-0 pb-6 sm:px-6 lg:px-8"
            >
                {/* Month header */}

                <div
                    className="mb-7 flex flex-wrap items-center justify-end gap-2 -mt-[20px] sm:gap-4 sm:-mt-[38px]"
                >
                    {/* Month Navigation */}

                    <div
                        className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-3"
                    >
                        {/* Previous Month */}

                        <button
                            type="button"
                            onClick={
                                handlePreviousMonth
                            }
                            disabled={loading}
                            className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9 rounded-md text-lg text-[#0b1b35] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Previous month"
                        >
                            ‹
                        </button>

                        {/* Month Select */}

                        <select
                            value={month}
                            onChange={(event) =>
                                setMonth(
                                    event.target.value
                                )
                            }
                            disabled={loading}
                            className="h-8 w-[132px] min-w-0 rounded-md cursor-pointer border sm:h-9 sm:w-auto sm:min-w-[130px] border-[#ddd6d1] bg-white px-3 text-[13px] font-medium text-[#0b1b35] outline-none focus:border-[#6b2d1a]"
                        >
                            {Array.from(
                                { length: 13 },
                                (_, index) => {
                                    const date =
                                        parseMonth(
                                            currentMonth
                                        );

                                    date.setMonth(
                                        date.getMonth() -
                                        6 +
                                        index
                                    );

                                    const value =
                                        formatMonth(
                                            date
                                        );

                                    return (
                                        <option
                                            key={value}
                                            value={value}
                                        >
                                            {formatMonthLabel(
                                                value
                                            )}
                                        </option>
                                    );
                                }
                            )}
                        </select>

                        {/* Next Month */}

                        <button
                            type="button"
                            onClick={
                                handleNextMonth
                            }
                            disabled={loading}
                            className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9 rounded-md text-lg text-[#0b1b35] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Next month"
                        >
                            ›
                        </button>
                    </div>

                    {/* Current Month */}

                    {month !== currentMonth && (
                        <button
                            type="button"
                            onClick={
                                handleCurrentMonth
                            }
                            className="rounded-md border border-[#ddd6d1] bg-white px-3 py-2 sm:px-4 text-[12px] font-medium text-[#6b2d1a] transition hover:bg-[#faf7f5]"
                        >
                            Current Month
                        </button>
                    )}
                </div>

                {/* Summary cards */}

                <div
                    className="mb-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <SummaryCard
                        icon="👤︎"
                        title="TOTAL EMPLOYEES"
                        value={
                            summary.total_employees
                        }
                        footer="Employees"
                    />

                    <SummaryCard
                        icon="◷"
                        title="TOTAL HOURS LOGGED"
                        value={`${summary.total_hours_logged}h`}
                        footer={
                            summary.total_employees >
                                0
                                ? `Avg. ${(
                                    summary.total_hours_logged /
                                    summary.total_employees
                                ).toFixed(1)}h / employee`
                                : "Avg. 0h / employee"
                        }
                    />

                    <SummaryCard
                        icon="▣"
                        title="TOTAL LEAVE DAYS"
                        value={
                            summary.total_leave_days
                        }
                        footer={
                            summary.pending_leave_approvals >
                                0
                                ? `${summary.pending_leave_approvals} pending approval`
                                : "No pending approvals"
                        }
                        footerClass={
                            summary.pending_leave_approvals >
                                0
                                ? "text-[#8a6500]"
                                : "text-[#3c6f3b]"
                        }
                    />

                    <SummaryCard
                        icon="!"
                        title="MISSING SUBMISSIONS"
                        value={
                            summary.missing_submissions
                        }
                        footer={
                            summary.missing_submissions >
                                0
                                ? "Requires action"
                                : "All submitted"
                        }
                        footerClass={
                            summary.missing_submissions >
                                0
                                ? "text-[#d33b3b]"
                                : "text-[#3c6f3b]"
                        }
                    />
                </div>

                {/* Employee timesheet table */}

                <div
                    className="w-full min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x rounded-md border border-[#e5d6ce] bg-white"
                >
                    <table
                        className="w-full min-w-[850px] table-fixed border-collapse"
                    >
                        {/* Header */}

                        <thead
                            className="sticky top-0 z-10"
                        >
                            <tr
                                className="h-[62px] bg-[#eef3fd]"
                            >
                                <th
                                    className="w-[230px] min-w-[230px] whitespace-nowrap border-b border-[#d9dce4] px-5 text-left text-[11px] font-semibold text-[#17243b]"
                                >
                                    EMPLOYEE
                                </th>

                                <th
                                    className="whitespace-nowrap border-b border-[#d9dce4] px-2 text-left text-[11px] font-semibold text-[#17243b]"
                                >
                                    WORKED HOURS
                                </th>

                                <th
                                    className="whitespace-nowrap border-b border-[#d9dce4] px-2 text-left text-[11px] font-semibold text-[#17243b]"
                                >
                                    LEAVE DAYS
                                </th>

                                <th
                                    className="whitespace-nowrap border-b border-[#d9dce4] px-2 text-left text-[11px] font-semibold text-[#17243b]"
                                >
                                    APPROVED WEEKS
                                </th>

                                <th
                                    className="whitespace-nowrap border-b border-[#d9dce4] px-2 text-left text-[11px] font-semibold text-[#17243b]"
                                >
                                    MISSING DATES
                                </th>

                                <th
                                    className="whitespace-nowrap border-b border-[#d9dce4] px-8 text-left text-[11px] font-semibold text-[#17243b]"
                                >
                                    STATUS
                                </th>
                            </tr>
                        </thead>

                        {/* Body */}

                        <tbody>
                            {loading ? (
                                <LoadingRows />
                            ) : employees.length > 0 ? (
                                employees.map(
                                    (employee) => (
                                        <EmployeeRow
                                            key={
                                                employee.employee_code
                                            }
                                            employee={
                                                employee
                                            }
                                            getStatusClass={
                                                getStatusClass
                                            }
                                            onProfileClick={() => {
                                                const role = getUserRole();

                                                if (role === "super admin") {
                                                    navigate(`/super-admin-dashboard/work-approval/timesheet/employee/${employee.employee_code}?month=${month}&view=monthly`);
                                                } else {
                                                    navigate(`/dashboard/work-approval/timesheet/employee/${employee.employee_code}?month=${month}&view=monthly`);
                                                }
                                            }}
                                        />
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        No employee data
                                        available for{" "}
                                        {formatMonthLabel(
                                            month
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
}

// Summary card

function SummaryCard({
    icon,
    title,
    value,
    footer,
    footerClass = "text-[#3c6f3b]",
}) {
    return (
        <div
            className="group w-full min-w-0 max-w-full rounded-md border border-[#e5d6ce] bg-white px-6 py-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_14px_30px_rgba(77,139,79,0.14)] motion-reduce:transition-none motion-reduce:hover:transform-none"
        >
            <div
                className="mb-5 flex h-9 w-9 items-center justify-center bg-[#eef3fa] text-[17px] text-[#006b3c]"
            >
                {icon}
            </div>

            <div
                className="text-[11px] font-medium text-[#17243b]"
            >
                {title}
            </div>

            <div
                className="mt-2 text-[20px] font-medium text-[#0b1b35]"
            >
                {value}
            </div>

            <div
                className={`mt-6 text-[12px] font-medium ${footerClass}`}
            >
                {footer}
            </div>
        </div>
    );
}

// Employee row

function EmployeeRow({
    employee,
    getStatusClass,
    onProfileClick,
}) {
    const avatarUrl =
        employee?.avatar_url;

    // Show initials if avatar fails to load

    const [avatarError, setAvatarError] =
        useState(false);

    const employeeName =
        employee?.employee_name ||
        "Unknown Employee";

    const initials =
        employeeName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (name) =>
                    name[0]?.toUpperCase()
            )
            .join("") || "?";

    const status =
        employee?.status ||
        "Unknown";

    return (
        <tr
            className="border-b border-[#e5d6ce] last:border-b-0 hover:bg-[#fafbfc]"
        >
            {/* Employee */}

            <td className="px-4 py-4 sm:px-5">
                <button
                    type="button"
                    onClick={onProfileClick}
                    className="flex min-w-0 items-center gap-2 text-left sm:gap-3 outline-none cursor-pointer"
                    aria-label={`Open ${employeeName} summary`}
                >
                    {/* Profile / Initials */}
                    {avatarUrl &&
                        !avatarError ? (
                        <img
                            src={
                                avatarUrl.startsWith(
                                    "http"
                                )
                                    ? avatarUrl
                                    : `${api.defaults.baseURL || ""}${avatarUrl}`
                            }
                            alt={
                                employeeName
                            }
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                            onError={() => {
                                setAvatarError(
                                    true
                                );
                            }}
                        />
                    ) : (
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f4f8] min-w-0 truncate text-[13px] font-semibold text-[#0b1b35]"
                        >
                            {initials}
                        </div>
                    )}

                    <div>
                        {/* Employee Name */}

                        <div
                            className="min-w-0 truncate text-[13px] font-semibold text-[#0b1b35]"
                        >
                            {employeeName}
                        </div>

                        {/* Employee Code */}

                        <div
                            className="mt-0.5 truncate text-[11px] text-slate-500"
                        >
                            {employee?.employee_code}
                        </div>
                    </div>
                </button>
            </td>

            {/* Worked Hours */}

            <td
                className="px-3 py-4 text-[13px] sm:px-4 text-[#17243b]"
            >
                {Number(
                    employee?.worked_hours ||
                    0
                )}
                h
            </td>

            {/* Leave Days */}

            <td
                className="px-3 py-4 text-[13px] sm:px-4 text-[#17243b]"
            >
                {Number(
                    employee?.leave_days ||
                    0
                )}
            </td>

            {/* Approved Weeks */}

            <td
                className="px-3 py-4 text-[13px] sm:px-4 text-[#17243b]"
            >
                {employee?.approved_weeks ||
                    "0/0"}
            </td>

            {/* Missing Dates */}

            <td
                className={`px-3 py-4 text-[13px] sm:px-4 ${Number(employee?.missing_dates || 0) > 0 ? "text-[#d33b3b]" : "text-slate-600"}`}
            >
                {Number(
                    employee?.missing_dates ||
                    0
                ) > 0
                    ? employee.missing_dates
                    : "None"}
            </td>

            {/* Status */}

            <td className="min-w-[100px] whitespace-nowrap px-3 py-4 sm:px-4">
                <span
                    className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] leading-tight font-semibold sm:px-3 sm:text-[11px] ${["Finalized", "Completed"].includes(status) ? "ml-0 sm:ml-4" : ""} ${getStatusClass(status)}`}
                >
                    {status}
                </span>
            </td>
        </tr>
    );
}

// Loading rows

function LoadingRows() {
    return (
        <>
            <style>
                {`
                    @keyframes tableShimmer {
                        0% {
                            transform: translateX(0);
                        }

                        100% {
                            transform: translateX(350%);
                        }
                    }
                `}
            </style>

            {[1, 2, 3].map(
                (row) => (
                    <tr
                        key={row}
                        className="border-b border-[#e5d6ce]"
                    >
                        <td
                            colSpan={6}
                            className="px-5 py-5"
                        >
                            <div
                                className="relative h-5 w-full overflow-hidden rounded bg-[#eef1f5]"
                            >
                                <div
                                    className="absolute inset-y-0 -left-[40%] w-[40%] bg-gradient-to-r from-transparent via-white/70 to-transparent animate-[tableShimmer_1.4s_linear_infinite]"
                                />
                            </div>
                        </td>
                    </tr>
                )
            )}
        </>
    );
}

export default MonthlyTimesheet;
