import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
    "https://uat-msspathway-software-backend-81057313575.asia-south1.run.app";

function EditTimesheet({
    employee,
    selectedWeek,
    month,
    onClose,
    onSave,
}) {
    /* =========================================================
       API / AUTH
    ========================================================= */

    const getAuthToken = () =>
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

    /* =========================================================
       WEEK DAYS
    ========================================================= */

    const weekDays = useMemo(() => {
        if (!selectedWeek?.week_start) {
            return [];
        }

        const startDate = new Date(
            `${selectedWeek.week_start}T00:00:00`
        );

        if (Number.isNaN(startDate.getTime())) {
            return [];
        }

        const days = [];

        // Monday to Friday
        for (let i = 0; i < 5; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const isoDate =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    date.getDate()
                ).padStart(2, "0")}`;

            days.push({
                date: isoDate,
                dateObject: date,

                dayName: date.toLocaleDateString("en-US", {
                    weekday: "long",
                }),

                dateLabel: date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
            });
        }

        return days;
    }, [selectedWeek]);

    /* =========================================================
       FORM DATA
    ========================================================= */

    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

const [error, setError] = useState("");   
 /* =========================================================
       LOAD WEEK FROM BACKEND
       
       GET:
       /timesheet/admin/timesheet/employee/{employee_code}/week/edit
       ?week_start=YYYY-MM-DD
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadWeekForEdit = async () => {
            const employeeCode = employee?.employee_code;
            const weekStart = selectedWeek?.week_start;

            if (!employeeCode || !weekStart) {
                setEntries([]);
                setError("");
                setLoading(false);
                return;
            }

           setLoading(true);
setError("");

            try {
                const token = getAuthToken();

                const url =
                    `${API_BASE_URL}/timesheet/admin/timesheet/employee/` +
                    `${encodeURIComponent(employeeCode)}/week/edit` +
                    `?week_start=${encodeURIComponent(weekStart)}`;

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",

                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                });

                if (!response.ok) {
                    let message =
                        `Unable to load timesheet (${response.status})`;

                    try {
                        const errorData = await response.json();

                        if (typeof errorData?.detail === "string") {
                            message = errorData.detail;
                        } else if (
                            typeof errorData?.message === "string"
                        ) {
                            message = errorData.message;
                        }
                    } catch {
                        // Keep default error message.
                    }

                    throw new Error(message);
                }

                const result = await response.json();

                if (cancelled) {
                    return;
                }

                /*
                 * Backend response:
                 *
                 * {
                 *   weekly_timesheet_id: 2,
                 *   employee_code: "MSS002",
                 *   employee_name: "Venkat k",
                 *   week_start: "2026-08-31",
                 *   week_end: "2026-09-04",
                 *   total_hours: 6.5,
                 *   overall_status: "partially_approved",
                 *   days: [...]
                 * }
                 */

                const apiDays = Array.isArray(result?.days)
                    ? result.days
                    : [];

                const newEntries = weekDays.map((day) => {
                    const apiDay = apiDays.find(
                        (item) => item?.date === day.date
                    );

                    return {
                        date: day.date,

                        day_label:
                            apiDay?.day_label ||
                            day.dayName,

                        hours:
                            apiDay?.hours !== undefined &&
                                apiDay?.hours !== null
                                ? String(apiDay.hours)
                                : "0",

                        description:
                            apiDay?.description !== undefined &&
                                apiDay?.description !== null
                                ? String(apiDay.description)
                                : "",

                        status:
                            apiDay?.status ||
                            "missing",
                    };
                });

                setEntries(newEntries);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load timesheet for edit:",
                    err
                );

                setError(
                    err?.message ||
                    "Failed to load the selected week's timesheet."
                );

                /*
                 * Keep the form usable even if API fails.
                 */
                const fallbackUnloggedDates =
                    employee?.unlogged_dates || [];

                const fallbackEntries = weekDays.map((day) => {
                    const existingDay =
                        fallbackUnloggedDates.find(
                            (item) =>
                                item?.date === day.date
                        );

                    return {
                        date: day.date,

                        day_label: day.dayName,

                        hours:
                            existingDay?.hours !== undefined &&
                                existingDay?.hours !== null
                                ? String(existingDay.hours)
                                : "0",

                        description: "",

                        status:
                            existingDay?.status ||
                            "missing",
                    };
                });

                setEntries(fallbackEntries);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadWeekForEdit();

        return () => {
            cancelled = true;
        };
    }, [
        employee?.employee_code,
        employee?.unlogged_dates,
        selectedWeek?.week_start,
        weekDays,
    ]);

    /* =========================================================
       TOTAL HOURS
    ========================================================= */

    const totalHours = useMemo(() => {
        return entries.reduce((total, item) => {
            const hours = Number(item?.hours);

            if (Number.isNaN(hours)) {
                return total;
            }

            return total + hours;
        }, 0);
    }, [entries]);

    /* =========================================================
       UPDATE HOURS
    ========================================================= */

   const handleHoursChange = (index, value) => {
    setError("");

    setEntries((previous) =>
        previous.map((item, itemIndex) =>
            itemIndex === index
                ? {
                    ...item,
                    hours: value,
                }
                : item
        )
    );
};

    /* =========================================================
       UPDATE DESCRIPTION
    ========================================================= */

    const handleDescriptionChange = (index, value) => {
        setError("");
        setSaveSuccess("");

        setEntries((previous) =>
            previous.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        description: value,
                    }
                    : item
            )
        );
    };

    /* =========================================================
       SAVE
    ========================================================= */

  const handleSave = async () => {
    if (loading || saving) {
        return;
    }

    setError("");

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    const invalidEntry = entries.find((item) => {
        const hours = Number(item?.hours);

        return (
            item?.hours === "" ||
            Number.isNaN(hours) ||
            hours < 0 ||
            hours > 24 ||
            (hours * 2) % 1 !== 0
        );
    });

    if (invalidEntry) {
        setError(
            `Invalid hours for ${invalidEntry.date}. ` +
            `Enter a value between 0 and 24 in 0.5 hour steps.`
        );

        return;
    }

    /* -------------------------------------------------------
       PAYLOAD
    ------------------------------------------------------- */

    const payload = {
        employee_code:
            employee?.employee_code || "",

        month:
            month || "",

        week_number:
            selectedWeek?.week_number || null,

        weekly_timesheet_id:
            selectedWeek?.weekly_timesheet_id || null,

        week_start:
            selectedWeek?.week_start || "",

        week_end:
            selectedWeek?.week_end ||
            entries?.[entries.length - 1]?.date ||
            "",

        total_hours:
            totalHours,

        entries: entries.map((entry) => ({
            date: entry.date,

            hours:
                Number(entry.hours || 0),

            description:
                entry.description || "",
        })),

        days: entries.map((entry) => ({
            date: entry.date,

            day_label:
                entry.day_label || "",

            hours:
                Number(entry.hours || 0),

            description:
                entry.description || null,

            status:
                entry.status || "missing",
        })),
    };

    /* -------------------------------------------------------
       CHECK SAVE HANDLER
    ------------------------------------------------------- */

    if (typeof onSave !== "function") {
        setError(
            "Save handler is not available."
        );

        return;
    }

    /* -------------------------------------------------------
       SAVE START
    ------------------------------------------------------- */

    try {
        setSaving(true);

        await onSave(payload);

    } catch (err) {
        console.error(
            "Failed to save timesheet:",
            err
        );
    } finally {
        setSaving(false);
    }
};

    /* =========================================================
       DATE RANGE LABEL
    ========================================================= */

    const dateRangeLabel = useMemo(() => {
        if (!weekDays.length) {
            return "";
        }

        const firstDay =
            weekDays[0]?.dateObject;

        const lastDay =
            weekDays[weekDays.length - 1]?.dateObject;

        if (!firstDay || !lastDay) {
            return "";
        }

        const firstLabel =
            firstDay.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                }
            );

        const lastLabel =
            lastDay.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }
            );

        return `${firstLabel} - ${lastLabel}`;
    }, [weekDays]);

    /* =========================================================
       POPUP
    ========================================================= */

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/60
                backdrop-blur-[18px]
                p-4
            "
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !loading &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            {/* =================================================
                MODAL
            ================================================= */}

            <div
                className="
                    flex
                    w-full
                    max-w-[900px]
                    max-h-[90vh]
                    flex-col
                    overflow-hidden
                    rounded-[7px]
                    border
                    border-[#D7D9D8]
                    bg-[#F8F9FC]
                    shadow-2xl
                "
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex items-start justify-between px-5 pt-4 pb-3">
                    <div>
                        <h2 className="text-[13px] font-medium text-[#002B5B]">
                            Edit Timesheet
                        </h2>

                        <p className="mt-1 text-[11px] text-slate-500">
                            Editing hours for{" "}
                            {dateRangeLabel}
                        </p>

                        {employee?.employee_name && (
                            <p className="mt-1 text-[10px] text-slate-400">
                                {employee.employee_name}

                                {employee?.employee_code
                                    ? ` • ${employee.employee_code}`
                                    : ""}
                            </p>
                        )}
                    </div>

                    {/* =================================================
                        RIGHT HEADER
                    ================================================= */}

                    <div className="flex items-start gap-5">

                        {/* STATUS */}

                        <div className="pt-1">
                            <span
                                className="
                                    inline-flex
                                    rounded-full
                                    bg-[#A7E9C0]
                                    px-3
                                    py-[3px]
                                    text-[9px]
                                    font-bold
                                    tracking-wide
                                    text-[#006B3C]
                                "
                            >
                                DRAFT
                            </span>
                        </div>

                        {/* TOTAL HOURS */}

                        <div className="text-right">
                            <p className="text-[8px] font-bold uppercase text-[#002B5B]">
                                Total Hours
                            </p>

                            <p className="text-[17px] leading-5 text-[#002B5B]">
                                {totalHours.toFixed(1)}
                            </p>
                        </div>

                        {/* CLOSE */}

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={
                                loading ||
                                saving
                            }
                            className="
                                ml-1
                                cursor-pointer
                                text-[18px]
                                leading-none
                                text-slate-400
                                transition
                                hover:text-slate-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>

               

                {/* =================================================
                    API ERROR
                ================================================= */}

                {error && (
                    <div className="mx-5 mb-3 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] leading-4 text-red-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                                className="
                                    shrink-0
                                    text-[12px]
                                    leading-none
                                    text-red-400
                                    hover:text-red-600
                                "
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* =================================================
                    TABLE CONTAINER
                ================================================= */}

                <div className="relative mx-5 overflow-hidden rounded-[7px] border border-[#C9D1D0] bg-white">

                    {/* =================================================
                        LOADER OVERLAY
                    ================================================= */}

                    {loading && (
                        <div
                            className="
                                absolute
                                inset-0
                                z-20
                                flex
                                items-center
                                justify-center
                                bg-white/70
                                backdrop-blur-[2px]
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-[6px]
                                    border
                                    border-[#D7D9D8]
                                    bg-white
                                    px-4
                                    py-2.5
                                    shadow-sm
                                "
                            >
                                <span
                                    className="
                                        h-3.5
                                        w-3.5
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-[#006B3C]/25
                                        border-t-[#006B3C]
                                    "
                                />

                                <span className="text-[10px] font-semibold text-[#002B5B]">
                                    Loading timesheet...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <div
                        className="
                            grid
                            grid-cols-[105px_95px_1fr]
                            items-center
                            border-b
                            border-[#C9D1D0]
                            bg-[#E8EFFB]
                            px-4
                            py-2.5
                        "
                    >
                        <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#002B5B]">
                            Date / Day
                        </div>

                        <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#002B5B]">
                            Hours
                        </div>

                        <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#002B5B]">
                            Description
                        </div>
                    </div>

                    {/* =================================================
                        TABLE ROWS
                    ================================================= */}

                    <div className="max-h-[430px] overflow-y-auto">

                        {weekDays.length === 0 ? (
                            <div className="px-5 py-10 text-center text-xs text-slate-500">
                                No week information available.
                            </div>
                        ) : (
                            weekDays.map(
                                (day, index) => {
                                    const entry =
                                        entries[index] || {
                                            date: day.date,
                                            day_label:
                                                day.dayName,
                                            hours: "0",
                                            description: "",
                                            status: "missing",
                                        };

                                    return (
                                        <div
                                            key={day.date}
                                            className="
                                                grid
                                                grid-cols-[105px_95px_1fr]
                                                items-center
                                                border-b
                                                border-[#D9DEDC]
                                                px-4
                                                py-2.5
                                                last:border-b-0
                                            "
                                        >
                                            {/* =================================================
                                                DATE / DAY
                                            ================================================= */}

                                            <div>
                                                <p className="text-[11px] font-semibold text-[#002B5B]">
                                                    {day.dateLabel}
                                                </p>

                                                <p className="mt-[1px] text-[8px] text-slate-500">
                                                    {day.dayName}
                                                </p>

                                                <p className="mt-[1px] text-[7px] uppercase tracking-wide text-slate-400">
                                                    {entry.status ||
                                                        "missing"}
                                                </p>
                                            </div>

                                            {/* =================================================
                                                HOURS
                                            ================================================= */}

                                            <div className="pr-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="24"
                                                    step="0.5"
                                                    value={
                                                        entry.hours
                                                    }
                                                    disabled={
                                                        loading ||
                                                        saving
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleHoursChange(
                                                            index,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="
                                                        h-[27px]
                                                        w-[65px]
                                                        rounded-[6px]
                                                        border
                                                        border-[#CCD3D2]
                                                        bg-[#F7F9FB]
                                                        px-2
                                                        text-center
                                                        text-[10px]
                                                        text-[#002B5B]
                                                        outline-none
                                                        transition
                                                        focus:border-[#006B3C]
                                                        focus:bg-white
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-60
                                                    "
                                                />
                                            </div>

                                            {/* =================================================
                                                DESCRIPTION
                                            ================================================= */}

                                            <div>
                                                <input
                                                    type="text"
                                                    value={
                                                        entry.description
                                                    }
                                                    disabled={
                                                        loading ||
                                                        saving
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleDescriptionChange(
                                                            index,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Enter description..."
                                                    className="
                                                        h-[27px]
                                                        w-full
                                                        rounded-[6px]
                                                        border
                                                        border-[#CCD3D2]
                                                        bg-[#F7F9FB]
                                                        px-3
                                                        text-[9px]
                                                        text-[#002B5B]
                                                        outline-none
                                                        transition
                                                        placeholder:text-slate-400
                                                        focus:border-[#006B3C]
                                                        focus:bg-white
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-60
                                                    "
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        )}
                    </div>
                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="mx-5 mt-5 border-t border-[#D5D9D8]" />

                <div className="flex items-center justify-end gap-2 px-5 py-4">

                    {/* CANCEL */}

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={
                            loading ||
                            saving
                        }
                        className="
                            cursor-pointer
                            rounded-[6px]
                            border
                            border-[#CCD3D2]
                            bg-white
                            px-5
                            py-2.5
                            text-[10px]
                            font-semibold
                            text-[#002B5B]
                            transition
                            hover:bg-[#F3F5F7]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    {/* SAVE */}

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={
                            loading ||
                            saving
                        }
                        className="
                            flex
                            min-w-[125px]
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            rounded-[6px]
                            bg-[#006B3C]
                            px-5
                            py-2.5
                            text-[10px]
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#005A32]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {saving ? (
                            <>
                                <span
                                    className="
                                        h-3
                                        w-3
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-white/30
                                        border-t-white
                                    "
                                />

                                Saving...
                            </>
                        ) : (
                            "Save Changes →"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditTimesheet;