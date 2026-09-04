import React, { useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://uat-msspathway-software-backend-81057313575.asia-south1.run.app";

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

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
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

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
};

/* ============================================================
   STATUS CONFIG
============================================================ */

const getStatusConfig = (status) => {
    switch (status) {
        case "approved":
            return {
                label: "APPROVED",
                badge:
                    "border-[#78a66f] bg-[#f2faef] text-[#28612d]",
            };

        case "submitted":
        case "pending":
        case "pending_approval":
            return {
                label: "PENDING APPROVAL",
                badge:
                    "border-[#e5b900] bg-[#fff8d9] text-[#885900]",
            };

        case "rejected":
            return {
                label: "REJECTED",
                badge:
                    "border-[#ef5555] bg-[#ffe8e8] text-[#c52222]",
            };

        case "leave":
        case "on_leave":
            return {
                label: "LEAVE",
                badge:
                    "border-[#f47ab8] bg-[#fff0f7] text-[#bd216d]",
            };

        case "holiday":
        case "public_holiday":
        case "publicholiday":
            return {
                label: "HOLIDAY",
                badge:
                    "border-[#4f8fff] bg-[#e3edff] text-[#1453c4]",
            };

        default:
            return {
                label: status
                    ? String(status).toUpperCase()
                    : "MISSING",
                badge:
                    "border-[#d8dce4] bg-[#f5f6f8] text-[#7a8290]",
            };
    }
};

/* ============================================================
   TIMESHEET DETAIL MODAL
============================================================ */

function TimesheetDetailModal({
    selectedDay,
    details,
    loading,
    error,
    onClose,
}) {
    const employee = selectedDay?.employee;
    const fallbackDay = selectedDay?.day;

    const status = String(
        details?.status ||
            fallbackDay?.status ||
            ""
    )
        .toLowerCase()
        .trim();

    const statusConfig = getStatusConfig(status);

    /* ========================================================
       ACTION STATES
    ======================================================== */

    const [actionLoading, setActionLoading] =
        useState(false);

    const [actionMessage, setActionMessage] =
        useState("");

    const [actionError, setActionError] =
        useState("");

    const [actionStatus, setActionStatus] =
        useState("");

    const [actionType, setActionType] =
        useState("");

    /* ========================================================
       REJECT POPUP STATES
    ======================================================== */

    const [showRejectPopup, setShowRejectPopup] =
        useState(false);

    const [rejectReason, setRejectReason] =
        useState("");

    const dayEntryId =
        details?.day_entry_id ||
        selectedDay?.day?.id;

    /* ========================================================
       TOKEN
    ======================================================== */

    const getActionToken = () => {
        return (
            localStorage.getItem("access_token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("authToken") ||
            ""
        );
    };

    /* ========================================================
       APPROVE
    ======================================================== */

    const handleApprove = async () => {
        if (!dayEntryId || actionLoading) {
            return;
        }

        setActionLoading(true);
        setActionType("approve");
        setActionMessage("");
        setActionError("");

        try {
            const token = getActionToken();

            const headers = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers.Authorization =
                    `Bearer ${token}`;
            }

            const response = await fetch(
                `${API_BASE_URL}/timesheet/admin/timesheet/day/${encodeURIComponent(
                    dayEntryId
                )}/approve`,
                {
                    method: "POST",
                    headers,
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                let message =
                    `Unable to approve timesheet (${response.status})`;

                if (
                    typeof data?.detail ===
                    "string"
                ) {
                    message = data.detail;
                } else if (
                    Array.isArray(data?.detail)
                ) {
                    message =
                        data.detail
                            .map(
                                (item) =>
                                    item?.msg ||
                                    item
                            )
                            .join(", ");
                }

                throw new Error(message);
            }

            setActionStatus("approved");

            setActionMessage(
                data?.detail ||
                    "Day approved"
            );
        } catch (err) {
            console.error(
                "Timesheet Approve Error:",
                err
            );

            setActionError(
                err?.message ||
                    "Unable to approve timesheet."
            );
        } finally {
            setActionLoading(false);
            setActionType("");
        }
    };

    /* ========================================================
       OPEN REJECT POPUP
    ======================================================== */

    const handleReject = () => {
        if (!dayEntryId || actionLoading) {
            return;
        }

        setActionMessage("");
        setActionError("");
        setRejectReason("");
        setShowRejectPopup(true);
    };

    /* ========================================================
       CANCEL REJECT
    ======================================================== */

    const handleCancelReject = () => {
        if (actionLoading) {
            return;
        }

        setShowRejectPopup(false);
        setRejectReason("");
        setActionError("");
    };

    /* ========================================================
       SUBMIT REJECT
    ======================================================== */

    const handleSubmitReject = async () => {
        if (!dayEntryId || actionLoading) {
            return;
        }

        const trimmedReason =
            rejectReason.trim();

        if (!trimmedReason) {
            setActionError(
                "Rejection reason is required."
            );
            return;
        }

        setActionLoading(true);
        setActionType("reject");
        setActionMessage("");
        setActionError("");

        try {
            const token = getActionToken();

            const headers = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers.Authorization =
                    `Bearer ${token}`;
            }

            const response = await fetch(
                `${API_BASE_URL}/timesheet/admin/timesheet/day/${encodeURIComponent(
                    dayEntryId
                )}/reject`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        reason: trimmedReason,
                    }),
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                let message =
                    `Unable to reject timesheet (${response.status})`;

                if (
                    typeof data?.detail ===
                    "string"
                ) {
                    message = data.detail;
                } else if (
                    Array.isArray(data?.detail)
                ) {
                    message =
                        data.detail
                            .map(
                                (item) =>
                                    item?.msg ||
                                    item
                            )
                            .join(", ");
                }

                throw new Error(message);
            }

            setActionStatus("rejected");

            setActionMessage(
                data?.detail ||
                    "Day rejected"
            );

            setShowRejectPopup(false);
            setRejectReason("");
        } catch (err) {
            console.error(
                "Timesheet Reject Error:",
                err
            );

            setActionError(
                err?.message ||
                    "Unable to reject timesheet."
            );
        } finally {
            setActionLoading(false);
            setActionType("");
        }
    };

    const displayStatus =
        actionStatus || status;

    const displayStatusConfig =
        getStatusConfig(displayStatus);

    return (
        <div
            className="
                fixed
                inset-0
                z-[9999]
                flex
                items-center
                justify-center
                bg-black/20
                px-4
                py-6
                backdrop-blur-[2px]
            "
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    if (!showRejectPopup) {
                        onClose();
                    }
                }
            }}
        >
            
            <div
                className="
                    relative
                    flex
                    max-h-[90vh]
                    w-full
                    max-w-[560px]
                    flex-col
                    overflow-hidden
                    rounded-[8px]
                    border
                    border-[#e5d8d2]
                    bg-white
                    shadow-[0_20px_60px_rgba(15,23,42,0.18)]
                "
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        flex-shrink-0
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[#e8e0dc]
                        bg-white
                        px-6
                        py-5
                    "
                >
                    <div>
                        <h2
                            className="
                                text-[20px]
                                font-semibold
                                text-[#0b1b35]
                            "
                        >
                            Timesheet Details
                        </h2>

                        <p
                            className="
                                mt-1
                                text-[11px]
                                text-[#7b8492]
                            "
                        >
                            View submitted work
                            details
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={actionLoading}
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-[#f5f6f8]
                            text-[18px]
                            text-[#566176]
                            transition
                            hover:bg-[#eceef2]
                            hover:text-[#0b1b35]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        ×
                    </button>
                </div>

                {/* ==================================================
                    SCROLLABLE CONTENT
                ================================================== */}

                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                        px-6
                        py-5
                    "
                >
                    {/* EMPLOYEE */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            border-b
                            border-[#eee7e3]
                            pb-5
                        "
                    >
                        {details?.avatar_url ||
                        employee?.avatar_url ? (
                            <img
                                src={`${API_BASE_URL}${
                                    details?.avatar_url ||
                                    employee?.avatar_url
                                }`}
                                alt=""
                                className="
                                    h-11
                                    w-11
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
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#f1f5f9]
                                    text-[18px]
                                "
                            >
                                {(
                                    details?.employee_name ||
                                    employee?.employee_name ||
                                    "--"
                                )
                                    .trim()
                                    .split(/\s+/)
                                    .filter(
                                        Boolean
                                    )
                                    .slice(
                                        0,
                                        2
                                    )
                                    .map(
                                        (
                                            name
                                        ) =>
                                            name.charAt(
                                                0
                                            )
                                    )
                                    .join("")
                                    .toUpperCase()}
                            </div>
                        )}

                        <div>
                            <div
                                className="
                                    text-[15px]
                                    font-semibold
                                    text-[#17243b]
                                "
                            >
                                {details?.employee_name ||
                                    employee?.employee_name ||
                                    "--"}
                            </div>

                            <div
                                className="
                                    mt-1
                                    text-[10px]
                                    text-[#7b8492]
                                "
                            >
                                #
                                {details?.employee_code ||
                                    employee?.employee_code ||
                                    "--"}
                            </div>

                            {details?.role && (
                                <div
                                    className="
                                        mt-1
                                        text-[10px]
                                        text-[#7b8492]
                                    "
                                >
                                    {details.role}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LOADING */}

                    {loading && (
                        <DetailLoading />
                    )}

                    {/* ERROR */}

                    {!loading &&
                        error && (
                            <div
                                className="
                                    mt-5
                                    rounded-[5px]
                                    border
                                    border-[#efb3b3]
                                    bg-[#fff5f5]
                                    px-4
                                    py-4
                                    text-[11px]
                                    text-[#b52323]
                                "
                            >
                                {error}
                            </div>
                        )}

                    {/* DETAILS */}

                    {!loading &&
                        !error &&
                        details && (
                            <>
                                {/* DATE / HOURS / STATUS */}

                                <div
                                    className="
                                        mt-5
                                        grid
                                        grid-cols-1
                                        gap-3
                                        sm:grid-cols-3
                                    "
                                >
                                    <DetailInfo
                                        label="WORK DATE"
                                        value={formatDetailDate(
                                            details.work_date
                                        )}
                                    />

                                    <DetailInfo
                                        label="TOTAL HOURS"
                                        value={formatHours(
                                            details.total_hours
                                        )}
                                    />

                                    <div
                                        className="
                                            rounded-[5px]
                                            border
                                            border-[#e7e0dc]
                                            bg-[#fafafa]
                                            px-4
                                            py-3
                                        "
                                    >
                                        <div
                                            className="
                                                mb-2
                                                text-[9px]
                                                font-semibold
                                                tracking-[0.3px]
                                                text-[#7b8492]
                                            "
                                        >
                                            STATUS
                                        </div>

                                        <span
                                            className={`
                                                inline-flex
                                                rounded-full
                                                border
                                                px-2.5
                                                py-1
                                                text-[9px]
                                                font-bold
                                                ${displayStatusConfig.badge}
                                            `}
                                        >
                                            {
                                                displayStatusConfig.label
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* PROJECT DETAILS */}

                                {Array.isArray(
                                    details.projects
                                ) &&
                                    details.projects.length >
                                        0 && (
                                        <div
                                            className="
                                                mt-5
                                                rounded-[5px]
                                                border
                                                border-[#e7e0dc]
                                                bg-white
                                            "
                                        >
                                            <div
                                                className="
                                                    border-b
                                                    border-[#eee7e3]
                                                    bg-[#f8f6f2]
                                                    px-4
                                                    py-3
                                                    text-[10px]
                                                    font-semibold
                                                    tracking-[0.3px]
                                                    text-[#5b4b45]
                                                "
                                            >
                                                PROJECT DETAILS
                                            </div>

                                            <div
                                                className="
                                                    divide-y
                                                    divide-[#eee7e3]
                                                "
                                            >
                                                {details.projects.map(
                                                    (
                                                        project,
                                                        index
                                                    ) => (
                                                        <ProjectItem
                                                            key={
                                                                index
                                                            }
                                                            project={
                                                                project
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* ACTIVITY */}

                                {Array.isArray(
                                    details.activity_descriptions
                                ) &&
                                    details
                                        .activity_descriptions
                                        .length >
                                        0 && (
                                        <div
                                            className="
                                                mt-5
                                                rounded-[5px]
                                                border
                                                border-[#e7e0dc]
                                                bg-white
                                            "
                                        >
                                            <div
                                                className="
                                                    border-b
                                                    border-[#eee7e3]
                                                    bg-[#f8f6f2]
                                                    px-4
                                                    py-3
                                                    text-[10px]
                                                    font-semibold
                                                    tracking-[0.3px]
                                                    text-[#5b4b45]
                                                "
                                            >
                                                ACTIVITY
                                            </div>

                                            <div
                                                className="
                                                    space-y-2
                                                    px-4
                                                    py-4
                                                "
                                            >
                                                {details.activity_descriptions.map(
                                                    (
                                                        activity,
                                                        index
                                                    ) => (
                                                        <div
                                                            key={
                                                                index
                                                            }
                                                            className="
                                                                flex
                                                                items-start
                                                                gap-2
                                                                text-[11px]
                                                                text-[#3d4655]
                                                            "
                                                        >
                                                            <span
                                                                className="
                                                                    mt-[2px]
                                                                    flex
                                                                    h-4
                                                                    w-4
                                                                    flex-shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-full
                                                                    bg-[#f2faef]
                                                                    text-[9px]
                                                                    font-bold
                                                                    text-[#28612d]
                                                                "
                                                            >
                                                                ✓
                                                            </span>

                                                            <span>
                                                                {
                                                                    activity
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* REJECTION NOTE */}

                                {details.rejection_note && (
                                    <div
                                        className="
                                            mt-5
                                            rounded-[5px]
                                            border
                                            border-[#efb3b3]
                                            bg-[#fff5f5]
                                            px-4
                                            py-4
                                        "
                                    >
                                        <div
                                            className="
                                                mb-2
                                                text-[9px]
                                                font-bold
                                                tracking-[0.3px]
                                                text-[#b52323]
                                            "
                                        >
                                            REJECTION NOTE
                                        </div>

                                        <div
                                            className="
                                                text-[11px]
                                                leading-5
                                                text-[#7b3030]
                                            "
                                        >
                                            {
                                                details.rejection_note
                                            }
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                    {/* SUCCESS MESSAGE */}

                    {actionMessage && (
                        <div
                            className="
                                mt-5
                                rounded-[5px]
                                border
                                border-[#78a66f]
                                bg-[#f2faef]
                                px-4
                                py-3
                                text-[11px]
                                font-medium
                                text-[#28612d]
                            "
                        >
                            {actionMessage}
                        </div>
                    )}

                    {/* ACTION ERROR */}

                    {actionError &&
                        !showRejectPopup && (
                            <div
                                className="
                                    mt-5
                                    rounded-[5px]
                                    border
                                    border-[#efb3b3]
                                    bg-[#fff5f5]
                                    px-4
                                    py-3
                                    text-[11px]
                                    font-medium
                                    text-[#b52323]
                                "
                            >
                                {actionError}
                            </div>
                        )}

                    {/* NO DETAILS */}

                    {!loading &&
                        !error &&
                        !details && (
                            <div
                                className="
                                    py-10
                                    text-center
                                    text-[12px]
                                    text-[#8b94a3]
                                "
                            >
                                No timesheet details
                                available.
                            </div>
                        )}
                </div>

                {/* ==================================================
                    FIXED FOOTER
                ================================================== */}

                <div
                    className="
                        flex
                        flex-shrink-0
                        items-center
                        justify-between
                        border-t
                        border-[#eee7e3]
                        bg-[#fcfcfd]
                        px-6
                        py-4
                    "
                >
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={
                                actionLoading ||
                                actionStatus ===
                                    "approved"
                            }
                            className="
                                rounded-[4px]
                                bg-[#4D8B4F]
                                px-5
                                py-2
                                text-[10px]
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#3f7541]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {actionLoading &&
                            actionType ===
                                "approve"
                                ? "Approving..."
                                : "Approve"}
                        </button>

                        <button
                            type="button"
                            onClick={handleReject}
                            disabled={
                                actionLoading ||
                                actionStatus ===
                                    "rejected"
                            }
                            className="
                                rounded-[4px]
                                border
                                border-[#6B2D1A]
                                bg-white
                                px-5
                                py-2
                                text-[10px]
                                font-semibold
                                text-[#6B2D1A]
                                transition
                                hover:bg-[#f8f6f2]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {actionLoading &&
                            actionType ===
                                "reject"
                                ? "Rejecting..."
                                : "Reject"}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={actionLoading}
                        className="
                            rounded-[4px]
                            border
                            border-[#ded4cf]
                            bg-white
                            px-5
                            py-2
                            text-[10px]
                            font-semibold
                            text-[#3d332f]
                            transition
                            hover:bg-[#f8f6f2]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        Close
                    </button>
                </div>

                {/* ==================================================
                    REJECT REASON POPUP
                ================================================== */}

                {showRejectPopup && (
                    <div
                        className="
                            absolute
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            bg-black/30
                            px-5
                            backdrop-blur-[2px]
                        "
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                handleCancelReject();
                            }
                        }}
                    >
                        <div
                            className="
                                w-full
                                max-w-[420px]
                                rounded-[8px]
                                border
                                border-[#e5d8d2]
                                bg-white
                                shadow-[0_20px_60px_rgba(15,23,42,0.22)]
                            "
                            onMouseDown={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                        >
                            {/* POPUP HEADER */}

                            <div
                                className="
                                    border-b
                                    border-[#eee7e3]
                                    px-5
                                    py-4
                                "
                            >
                                <h3
                                    className="
                                        text-[16px]
                                        font-semibold
                                        text-[#0b1b35]
                                    "
                                >
                                    Reject Timesheet
                                </h3>

                                <p
                                    className="
                                        mt-1
                                        text-[10px]
                                        text-[#7b8492]
                                    "
                                >
                                    Please provide a
                                    reason for rejecting
                                    this timesheet.
                                </p>
                            </div>

                            {/* POPUP CONTENT */}

                            <div className="px-5 py-4">
                                <label
                                    className="
                                        mb-2
                                        block
                                        text-[10px]
                                        font-semibold
                                        text-[#5b4b45]
                                    "
                                >
                                    Rejection Reason
                                    <span className="text-[#b52323]">
                                        {" "}
                                        *
                                    </span>
                                </label>

                                <textarea
                                    value={rejectReason}
                                    onChange={(
                                        event
                                    ) => {
                                        setRejectReason(
                                            event
                                                .target
                                                .value
                                        );

                                        if (
                                            actionError
                                        ) {
                                            setActionError(
                                                ""
                                            );
                                        }
                                    }}
                                    placeholder="Enter rejection reason..."
                                    rows={4}
                                    autoFocus
                                    disabled={
                                        actionLoading
                                    }
                                    className="
                                        w-full
                                        resize-none
                                        rounded-[5px]
                                        border
                                        border-[#ded4cf]
                                        bg-white
                                        px-3
                                        py-3
                                        text-[11px]
                                        text-[#17243b]
                                        outline-none
                                        transition
                                        placeholder:text-[#a0a6b1]
                                        focus:border-[#6B2D1A]
                                        focus:ring-1
                                        focus:ring-[#6B2D1A]/20
                                        disabled:cursor-not-allowed
                                        disabled:bg-[#f5f6f8]
                                    "
                                />

                                {actionError && (
                                    <div
                                        className="
                                            mt-2
                                            text-[10px]
                                            font-medium
                                            text-[#b52323]
                                        "
                                    >
                                        {actionError}
                                    </div>
                                )}
                            </div>

                            {/* POPUP FOOTER */}

                            <div
                                className="
                                    flex
                                    justify-end
                                    gap-2
                                    border-t
                                    border-[#eee7e3]
                                    bg-[#fcfcfd]
                                    px-5
                                    py-4
                                "
                            >
                                <button
                                    type="button"
                                    onClick={
                                        handleCancelReject
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    className="
                                        rounded-[4px]
                                        border
                                        border-[#ded4cf]
                                        bg-white
                                        px-5
                                        py-2
                                        text-[10px]
                                        font-semibold
                                        text-[#3d332f]
                                        transition
                                        hover:bg-[#f8f6f2]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleSubmitReject
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    className="
                                        rounded-[4px]
                                        bg-[#6B2D1A]
                                        px-5
                                        py-2
                                        text-[10px]
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-[#542315]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >
                                    {actionLoading &&
                                    actionType ===
                                        "reject"
                                        ? "Rejecting..."
                                        : "Reject"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ============================================================
   DETAIL INFO
============================================================ */

function DetailInfo({
    label,
    value,
}) {
    return (
        <div
            className="
                rounded-[5px]
                border
                border-[#e7e0dc]
                bg-[#fafafa]
                px-4
                py-3
            "
        >
            <div
                className="
                    mb-2
                    text-[9px]
                    font-semibold
                    tracking-[0.3px]
                    text-[#7b8492]
                "
            >
                {label}
            </div>

            <div
                className="
                    text-[13px]
                    font-semibold
                    text-[#17243b]
                "
            >
                {value}
            </div>
        </div>
    );
}

/* ============================================================
   PROJECT ITEM
============================================================ */

function ProjectItem({
    project,
}) {
    return (
        <div className="px-4 py-4">
            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                "
            >
                <DetailInfo
                    label="PROJECT"
                    value={
                        project?.project_name ||
                        "--"
                    }
                />

                <DetailInfo
                    label="TASK"
                    value={
                        project?.task_name ||
                        "--"
                    }
                />

                <DetailInfo
                    label="START TIME"
                    value={formatTime(
                        project?.start_time
                    )}
                />

                <DetailInfo
                    label="END TIME"
                    value={formatTime(
                        project?.end_time
                    )}
                />

                <DetailInfo
                    label="HOURS"
                    value={formatHours(
                        project?.hours
                    )}
                />
            </div>
        </div>
    );
}

/* ============================================================
   DETAIL LOADING
============================================================ */

function DetailLoading() {
    return (
        <div className="mt-6 space-y-4">
            <div
                className="
                    grid
                    grid-cols-1
                    gap-3
                    sm:grid-cols-3
                "
            >
                {[1, 2, 3].map(
                    (item) => (
                        <div
                            key={item}
                            className="
                                h-[70px]
                                animate-pulse
                                rounded-[5px]
                                bg-[#f3f4f6]
                            "
                        />
                    )
                )}
            </div>

            <div
                className="
                    h-[145px]
                    animate-pulse
                    rounded-[5px]
                    bg-[#f3f4f6]
                "
            />

            <div
                className="
                    h-[100px]
                    animate-pulse
                    rounded-[5px]
                    bg-[#f3f4f6]
                "
            />
        </div>
    );
}

export default TimesheetDetailModal;