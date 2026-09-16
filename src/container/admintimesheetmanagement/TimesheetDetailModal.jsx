import React, { useEffect, useState, useRef } from "react";
import { LockKeyhole } from "lucide-react";
import api from "../../api/axios";

// Dynamic API base URL from the centralized Axios configuration.
const API_BASE_URL = api.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || "";
// Format hours value for display.
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

// Format the work date for display.
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

// Convert time value to 12-hour format.
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

// Get badge label and style based on status.
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

        case "unlogged":
        case "missing":
            return {
                label: "UNLOGGED",
                badge:
                    "border-[#d8dce4] bg-[#f5f6f8] text-[#7a8290]",
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

// Render the timesheet details modal.
function TimesheetDetailModal({
    selectedDay,
    details,
    loading,
    error,
    onClose,
    onSaved,
    isFinalized = false,
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

    // Missing / unlogged day detection.
    const isMissingDay =
        status === "missing" ||
        status === "unlogged" ||
        details?.is_unlogged === true ||
        fallbackDay?.is_unlogged === true ||
        !fallbackDay?.id;

    const [actionLoading, setActionLoading] =
        useState(false);

    const [actionMessage, setActionMessage] =
        useState("");

    const [showSuccessPopup, setShowSuccessPopup] =
        useState(false);

    const [successPopupType, setSuccessPopupType] =
        useState("");
    const [actionError, setActionError] =
        useState("");

    const [actionStatus, setActionStatus] =
        useState("");

    const [actionType, setActionType] =
        useState("");

    const [showRejectPopup, setShowRejectPopup] =
        useState(false);

    const [rejectReason, setRejectReason] =
        useState("");

    // Holds the newly created UNLOGGED day while the rejection reason popup is open.
    const [pendingRejectDayEntryId, setPendingRejectDayEntryId] =
        useState(null);
    const [pendingRejectDetails, setPendingRejectDetails] =
        useState(null);

    const [isEditing, setIsEditing] =
        useState(false);

    const [saveLoading, setSaveLoading] =
        useState(false);

    const [editError, setEditError] =
        useState("");

    const [editableDetails, setEditableDetails] =
        useState(details || null);

    const [timeValidationErrors, setTimeValidationErrors] =
        useState({});

    // Field-level validation messages for each project.
    const [projectFieldErrors, setProjectFieldErrors] =
        useState({});

    // Unlogged days cannot be approved/rejected until admin saves
    // at least one complete project and the backend creates the day entry.
    const [missingDaySubmitted, setMissingDaySubmitted] =
        useState(false);

    const skipNextDetailsSyncRef = useRef(false);

    const dayEntryId =
        details?.day_entry_id ||
        editableDetails?.day_entry_id ||
        selectedDay?.day?.id;

    useEffect(() => {
        if (skipNextDetailsSyncRef.current) {
            skipNextDetailsSyncRef.current = false;
            return;
        }

        const incomingStatus = String(details?.status || "")
            .toLowerCase()
            .trim();

        // Preserve the locally saved/actioned status so a parent refresh
        // cannot temporarily overwrite the status shown in this popup.
        const preservedActionStatus = [
            "submitted",
            "approved",
            "rejected",
        ].includes(actionStatus);

        const syncedDetails =
            preservedActionStatus
                ? {
                    ...(details || {}),
                    status: actionStatus,
                }
                : details || null;

        setEditableDetails(syncedDetails);
        setIsEditing(false);
        setEditError("");
        setTimeValidationErrors({});
        setProjectFieldErrors({});

        setMissingDaySubmitted(
            ["submitted", "approved", "rejected"].includes(incomingStatus) ||
            preservedActionStatus
        );

        if (preservedActionStatus) {
            setActionStatus(actionStatus);
        } else if (["submitted", "approved", "rejected"].includes(incomingStatus)) {
            setActionStatus(incomingStatus);
        } else {
            setActionStatus("");
        }
        setActionType("");
        setActionMessage("");
        setShowSuccessPopup(false);
        setSuccessPopupType("");
        setActionError("");
        setShowRejectPopup(false);
        setRejectReason("");
        setPendingRejectDayEntryId(null);
        setPendingRejectDetails(null);
    }, [details]);

    // Extract timesheet details from the API response.
    const extractDayDetails = (data) =>
        data?.data ||
        data?.timesheet ||
        (data?.detail &&
            typeof data.detail === "object" &&
            !Array.isArray(data.detail)
            ? data.detail
            : data);

    // Update one editable timesheet field.
    const updateEditableField = (field, value) => {
        setEditableDetails((prev) => ({
            ...(prev || {}),
            [field]: value,
        }));
    };

    // Calculate project hours only from start and end time.
    const calculateHoursFromTime = (startTime, endTime) => {
        if (!startTime || !endTime) {
            return null;
        }

        const startParts = String(startTime).split(":").map(Number);
        const endParts = String(endTime).split(":").map(Number);

        if (
            startParts.length < 2 ||
            endParts.length < 2 ||
            Number.isNaN(startParts[0]) ||
            Number.isNaN(startParts[1]) ||
            Number.isNaN(endParts[0]) ||
            Number.isNaN(endParts[1])
        ) {
            return null;
        }

        const startMinutes = startParts[0] * 60 + startParts[1];
        const endMinutes = endParts[0] * 60 + endParts[1];

        // End time must always be after start time.
        if (endMinutes <= startMinutes) {
            return null;
        }

        return Number(((endMinutes - startMinutes) / 60).toFixed(2));
    };

    // Calculate total hours from all projects.
    const calculateTotalHours = (projects) => {
        if (!Array.isArray(projects)) {
            return 0;
        }

        return Number(
            projects
                .reduce(
                    (total, project) =>
                        total + (Number(project?.hours) || 0),
                    0
                )
                .toFixed(2)
        );
    };

    // Validate project times and the maximum daily working hours before saving.
    const validateProjectTimes = (projects) => {
        if (!Array.isArray(projects)) {
            return "No project details are available to save.";
        }

        let totalHours = 0;

        for (let index = 0; index < projects.length; index += 1) {
            const project = projects[index] || {};
            const startTime = String(project?.start_time || "").trim();
            const endTime = String(project?.end_time || "").trim();

            if (!startTime || !endTime) {
                return `Project ${index + 1}: Start time and end time are required.`;
            }

            const startParts = startTime.split(":").map(Number);
            const endParts = endTime.split(":").map(Number);

            if (
                startParts.length < 2 ||
                endParts.length < 2 ||
                Number.isNaN(startParts[0]) ||
                Number.isNaN(startParts[1]) ||
                Number.isNaN(endParts[0]) ||
                Number.isNaN(endParts[1])
            ) {
                return `Project ${index + 1}: Please enter valid start and end times.`;
            }

            const startMinutes = startParts[0] * 60 + startParts[1];
            const endMinutes = endParts[0] * 60 + endParts[1];

            // End time must always be later than start time.
            if (endMinutes <= startMinutes) {
                return `Project ${index + 1}: End time must be after start time.`;
            }

            const projectHours = Number(
                ((endMinutes - startMinutes) / 60).toFixed(2)
            );

            totalHours += projectHours;
        }

        totalHours = Number(totalHours.toFixed(2));

        // A single day cannot contain more than 12 working hours.
        if (totalHours > 12) {
            return "Total working hours cannot exceed 12 hours in a day.";
        }

        return "";
    };

    // Update a project field and derive hours only from the selected times.
    const updateProjectField = (index, field, value) => {
        // Clear the field error as soon as the user edits that field.
        setProjectFieldErrors((prevErrors) => {
            const nextErrors = { ...prevErrors };
            const currentErrors = {
                ...(nextErrors[index] || {}),
            };

            delete currentErrors[field];

            if (Object.keys(currentErrors).length === 0) {
                delete nextErrors[index];
            } else {
                nextErrors[index] = currentErrors;
            }

            return nextErrors;
        });

        setEditableDetails((prev) => {
            const projects = Array.isArray(prev?.projects)
                ? prev.projects.map((project) => ({ ...project }))
                : [];

            const currentProject = projects[index] || {};

            // Hours cannot be manually changed; they are always calculated from time.
            if (field === "hours") {
                return prev;
            }

            const updatedProject = {
                ...currentProject,
                [field]: value,
            };

            if (field === "start_time" || field === "end_time") {
                const startTime =
                    field === "start_time"
                        ? value
                        : currentProject?.start_time || "";

                const endTime =
                    field === "end_time"
                        ? value
                        : currentProject?.end_time || "";

                let validationMessage = "";

                if (startTime && endTime) {
                    const startParts = String(startTime).split(":").map(Number);
                    const endParts = String(endTime).split(":").map(Number);

                    if (
                        startParts.length >= 2 &&
                        endParts.length >= 2 &&
                        !Number.isNaN(startParts[0]) &&
                        !Number.isNaN(startParts[1]) &&
                        !Number.isNaN(endParts[0]) &&
                        !Number.isNaN(endParts[1])
                    ) {
                        const startMinutes =
                            startParts[0] * 60 + startParts[1];
                        const endMinutes =
                            endParts[0] * 60 + endParts[1];

                        if (endMinutes <= startMinutes) {
                            validationMessage =
                                "End time must be after start time.";
                        }
                    }
                }

                // Hours are always derived from the time range.
                updatedProject.hours =
                    calculateHoursFromTime(startTime, endTime) ?? 0;

                projects[index] = updatedProject;

                const totalHours = calculateTotalHours(projects);

                if (!validationMessage && totalHours > 12) {
                    validationMessage =
                        "Total working hours cannot exceed 12 hours in a day.";
                }

                setTimeValidationErrors((prevErrors) => {
                    const nextErrors = { ...prevErrors };

                    if (validationMessage) {
                        nextErrors[index] = validationMessage;
                    } else {
                        delete nextErrors[index];
                    }

                    return nextErrors;
                });

                // Show the same validation directly on the time field.
                setProjectFieldErrors((prevErrors) => {
                    const nextErrors = { ...prevErrors };
                    const currentErrors = {
                        ...(nextErrors[index] || {}),
                    };

                    delete currentErrors.start_time;
                    delete currentErrors.end_time;

                    if (validationMessage) {
                        if (
                            validationMessage ===
                            "End time must be after start time."
                        ) {
                            currentErrors.end_time = validationMessage;
                        } else {
                            currentErrors.start_time = validationMessage;
                            currentErrors.end_time = validationMessage;
                        }
                    }

                    if (Object.keys(currentErrors).length === 0) {
                        delete nextErrors[index];
                    } else {
                        nextErrors[index] = currentErrors;
                    }

                    return nextErrors;
                });

                setEditError(validationMessage || "");
            } else {
                projects[index] = updatedProject;
            }

            return {
                ...(prev || {}),
                projects,
                total_hours: calculateTotalHours(projects),
            };
        });
    };

    // Add another blank project without changing any existing project data.
    const handleAddProject = () => {
        if (saveLoading || isFinalized || !isEditing) {
            return;
        }

        setEditableDetails((prev) => ({
            ...(prev || {}),
            projects: [
                ...(Array.isArray(prev?.projects) ? prev.projects : []),
                {
                    project_name: "",
                    task_name: "",
                    start_time: "",
                    end_time: "",
                    hours: 0,
                    description: "",
                },
            ],
        }));

        setProjectFieldErrors({});
        setTimeValidationErrors({});
        setEditError("");
    };

    // Remove one project while keeping at least one project available.
    const handleRemoveProject = (index) => {
        if (saveLoading || isFinalized || !isEditing) {
            return;
        }

        setEditableDetails((prev) => {
            const projects = Array.isArray(prev?.projects)
                ? prev.projects
                : [];

            if (projects.length <= 1) {
                return prev;
            }

            const nextProjects = projects.filter(
                (_, projectIndex) => projectIndex !== index
            );

            return {
                ...(prev || {}),
                projects: nextProjects,
                total_hours: calculateTotalHours(nextProjects),
            };
        });

        // Index-based validation belongs to the old project list,
        // so rebuild it cleanly after a project is removed.
        setProjectFieldErrors({});
        setTimeValidationErrors({});
        setEditError("");
    };

    // Create field-level messages from the existing save validation rules.
    const buildProjectFieldErrors = (projects) => {
        const errors = {};

        if (!Array.isArray(projects)) {
            return errors;
        }

        projects.forEach((project, index) => {
            const startTime = String(project?.start_time || "").trim();
            const endTime = String(project?.end_time || "").trim();

            if (!startTime) {
                errors[index] = {
                    ...(errors[index] || {}),
                    start_time: "Start time is required.",
                };
            }

            if (!endTime) {
                errors[index] = {
                    ...(errors[index] || {}),
                    end_time: "End time is required.",
                };
            }

            if (startTime && endTime) {
                const startParts = startTime.split(":").map(Number);
                const endParts = endTime.split(":").map(Number);

                if (
                    startParts.length >= 2 &&
                    endParts.length >= 2 &&
                    !Number.isNaN(startParts[0]) &&
                    !Number.isNaN(startParts[1]) &&
                    !Number.isNaN(endParts[0]) &&
                    !Number.isNaN(endParts[1])
                ) {
                    const startMinutes =
                        startParts[0] * 60 + startParts[1];
                    const endMinutes =
                        endParts[0] * 60 + endParts[1];

                    if (endMinutes <= startMinutes) {
                        errors[index] = {
                            ...(errors[index] || {}),
                            end_time: "End time must be after start time.",
                        };
                    }
                }
            }
        });

        const totalHours = calculateTotalHours(projects);

        if (totalHours > 12) {
            for (let index = projects.length - 1; index >= 0; index -= 1) {
                if (Number(projects[index]?.hours) > 0) {
                    errors[index] = {
                        ...(errors[index] || {}),
                        start_time:
                            errors[index]?.start_time ||
                            "Total working hours cannot exceed 12 hours in a day.",
                        end_time:
                            errors[index]?.end_time ||
                            "Total working hours cannot exceed 12 hours in a day.",
                    };
                    break;
                }
            }
        }

        return errors;
    };

    // Prepare current details for editing.
    const handleStartEdit = () => {
        // Prevent editing after the timesheet is finalized.
        if (isFinalized) {
            return;
        }

        // Missing / unlogged day starts with one blank project.
        if (isMissingDay) {
            const workDate =
                details?.work_date ||
                fallbackDay?.work_date ||
                fallbackDay?.date ||
                selectedDay?.date ||
                null;

            setEditableDetails({
                ...(details || {}),
                work_date: workDate,
                status: "",
                notes: details?.notes || "",
                projects: [
                    {
                        project_name: "",
                        task_name: "",
                        start_time: "",
                        end_time: "",
                        hours: 0,
                        description: "",
                    },
                ],
            });

            setEditError("");
            setTimeValidationErrors({});
            setProjectFieldErrors({});
            setActionError("");
            setActionMessage("");
            setMissingDaySubmitted(false);
            setIsEditing(true);
            return;
        }

        setEditableDetails(
            details
                ? {
                    ...details,
                    status:
                        String(details?.status || "")
                            .toLowerCase()
                            .trim() === "pending_approval"
                            ? "pending"
                            : details?.status || "",
                    projects: Array.isArray(details.projects)
                        ? details.projects.map((project) => ({
                            ...project,
                        }))
                        : [],
                }
                : null
        );
        setEditError("");
        setTimeValidationErrors({});
        setProjectFieldErrors({});
        setActionError("");
        setActionMessage("");
        setIsEditing(true);
    };

    // Restore original details and exit edit mode.
    const handleCancelEdit = () => {
        if (saveLoading) return;

        setEditableDetails(
            details
                ? {
                    ...details,
                    status:
                        String(details?.status || "")
                            .toLowerCase()
                            .trim() === "pending_approval"
                            ? "pending"
                            : details?.status || "",
                    projects: Array.isArray(details.projects)
                        ? details.projects.map((project) => ({
                            ...project,
                        }))
                        : [],
                }
                : null
        );
        setEditError("");
        setTimeValidationErrors({});
        setIsEditing(false);
    };

    // Save edited timesheet details through the API.
    const handleSaveEdit = async () => {
        // Prevent saving after the timesheet is finalized.
        if (isFinalized) {
            return;
        }

        if (saveLoading) {
            return;
        }

        if (!isMissingDay && !dayEntryId) {
            setEditError(
                "This day has no backend entry ID, so it cannot be saved yet."
            );
            return;
        }

        const currentProjects = Array.isArray(editableDetails?.projects)
            ? editableDetails.projects.map((project) => ({
                ...project,
                hours:
                    calculateHoursFromTime(
                        project?.start_time,
                        project?.end_time
                    ) ?? 0,
            }))
            : [];

        // Validate time order and the 12-hour daily limit before saving.
        const timeError = validateProjectTimes(currentProjects);
        const fieldErrors = buildProjectFieldErrors(currentProjects);

        setProjectFieldErrors(fieldErrors);

        if (timeError) {
            setEditError(timeError);
            return;
        }

        setSaveLoading(true);
        setEditError("");
        setActionError("");
        setActionMessage("");

        try {


            const normalizedStatus =
                String(editableDetails?.status || "")
                    .toLowerCase()
                    .trim() === "pending_approval"
                    ? "pending"
                    : String(editableDetails?.status || "")
                        .toLowerCase()
                        .trim();

            const projects = Array.isArray(editableDetails?.projects)
                ? editableDetails.projects.map((project) => ({
                    project_name: project?.project_name || "",
                    task_name: project?.task_name || "",
                    start_time: project?.start_time || "",
                    end_time: project?.end_time || "",
                    hours:
                        calculateHoursFromTime(
                            project?.start_time,
                            project?.end_time
                        ) ?? 0,
                    description: project?.description || "",
                }))
                : [];

            const projectTotalHours = calculateTotalHours(projects);

            // Missing / unlogged day uses the dedicated admin-submit POST.
            // Validation and automatic hour calculation remain the same.
            if (isMissingDay) {
                const employeeCode =
                    details?.employee_code ||
                    editableDetails?.employee_code ||
                    employee?.employee_code ||
                    selectedDay?.employee?.employee_code;

                const workDate =
                    editableDetails?.work_date ||
                    details?.work_date ||
                    fallbackDay?.work_date ||
                    fallbackDay?.date ||
                    selectedDay?.date ||
                    null;

                if (!employeeCode) {
                    setEditError(
                        "Employee code is required to submit this missing day."
                    );
                    return;
                }

                if (!workDate) {
                    setEditError(
                        "Work date is required to submit this missing day."
                    );
                    return;
                }

                const selectedStatus =
                    String(editableDetails?.status || "approved")
                        .toLowerCase()
                        .trim();

                const adminSubmitPayload = {
                    work_date: workDate,
                    projects,
                    notes: editableDetails?.notes || "",
                };

                // API: POST /timesheet/admin/timesheet/employee/:employeeCode/day/admin-submit
                // Purpose: Create a backend day entry for a missing/unlogged day.
                const adminSubmitUrl =
                    `/timesheet/admin/timesheet/employee/${encodeURIComponent(
                        employeeCode
                    )}/day/admin-submit`;

                console.log(
                    "[MISSING DAY ADMIN SUBMIT] POST",
                    `${API_BASE_URL}${adminSubmitUrl}`,
                    adminSubmitPayload
                );

                const response = await api.post(
                    adminSubmitUrl,
                    adminSubmitPayload
                );

                const data = response.data;

                const backendDetails =
                    data?.data ||
                    data?.timesheet ||
                    (data?.detail &&
                        typeof data.detail === "object" &&
                        !Array.isArray(data.detail)
                        ? data.detail
                        : data);

                const responseProjects =
                    Array.isArray(backendDetails?.projects)
                        ? backendDetails.projects
                        : projects;

                const createdDayEntryId =
                    backendDetails?.day_entry_id ||
                    backendDetails?.id ||
                    data?.day_entry_id ||
                    data?.id ||
                    null;

                if (!createdDayEntryId) {
                    throw new Error(
                        "The missing day was created, but no day entry ID was returned for approval."
                    );
                }

                // Apply the status selected in the UNLOGGED edit dropdown.
                // Submitted keeps the backend-created entry pending; Approved
                // explicitly approves it. Rejected must open the existing
                // rejection-reason popup before calling the reject API.
                if (selectedStatus === "approved") {
                    await api.post(
                        `/timesheet/admin/timesheet/day/${encodeURIComponent(
                            createdDayEntryId
                        )}/approve`
                    );
                }

                const submittedDetails = {
                    ...(editableDetails || {}),
                    ...(backendDetails || {}),
                    employee_code: employeeCode,
                    work_date: workDate,
                    status:
                        selectedStatus === "pending_approval"
                            ? "submitted"
                            : selectedStatus,
                    total_hours:
                        calculateTotalHours(responseProjects),
                    notes:
                        backendDetails?.notes ??
                        adminSubmitPayload.notes,
                    projects: responseProjects,
                    day_entry_id: createdDayEntryId,
                };

                // Rejected requires the existing rejection popup so the admin
                // can provide the required rejection reason.
                if (selectedStatus === "rejected") {
                    const pendingDetails = {
                        ...submittedDetails,
                        status: "rejected",
                    };

                    setPendingRejectDayEntryId(createdDayEntryId);
                    setPendingRejectDetails(pendingDetails);
                    setRejectReason("");
                    setActionError("");
                    setActionMessage("");
                    setShowRejectPopup(true);
                    setIsEditing(false);
                    setEditError("");
                    setTimeValidationErrors({});
                    setProjectFieldErrors({});
                    return;
                }

                // The unlogged day is now a real backend entry with the
                // status selected by the admin in the Save flow.
                setMissingDaySubmitted(true);
                setActionStatus(
                    selectedStatus === "pending_approval"
                        ? "submitted"
                        : selectedStatus
                );

                skipNextDetailsSyncRef.current = true;
                setEditableDetails(submittedDetails);
                setIsEditing(false);
                setEditError("");
                setTimeValidationErrors({});
                setProjectFieldErrors({});
                setActionMessage("");
                setSuccessPopupType("saved");
                setShowSuccessPopup(true);

                onSaved?.(submittedDetails);

                return;
            }

            const payload = {
                work_date:
                    details?.work_date ||
                    editableDetails?.work_date ||
                    null,
                status: normalizedStatus,
                total_hours: projectTotalHours,
                notes: editableDetails?.notes || "",
                leave_type:
                    normalizedStatus === "leave" ||
                        normalizedStatus === "on_leave"
                        ? editableDetails?.leave_type || ""
                        : "",
                projects,
            };

            // API: PUT /timesheet/admin/timesheet/day/:dayEntryId
            // Purpose: Update an existing timesheet day entry.
            console.log(
                "[TIMESHEET SAVE] PUT",
                `${API_BASE_URL}/timesheet/admin/timesheet/day/${dayEntryId}`,
                payload
            );

            let response;

            try {
                response = await api.put(
                    `/timesheet/admin/timesheet/day/${encodeURIComponent(
                        dayEntryId
                    )}`,
                    payload
                );
            } catch (error) {
                const data = error?.response?.data;
                const status = error?.response?.status;

                let message =
                    `Unable to update timesheet (${status || "unknown"})`;

                if (typeof data?.detail === "string") {
                    message = data.detail;
                } else if (Array.isArray(data?.detail)) {
                    message = data.detail
                        .map((item) => item?.msg || item)
                        .join(", ");
                }

                throw new Error(message);
            }

            const data = response.data;

            console.log("[TIMESHEET SAVE] RESPONSE", response.status, data);

            const submittedDetails = {
                ...(editableDetails || {}),
                day_entry_id:
                    editableDetails?.day_entry_id ||
                    details?.day_entry_id ||
                    dayEntryId,
                work_date:
                    details?.work_date ||
                    editableDetails?.work_date ||
                    null,
                status: normalizedStatus,
                total_hours: projectTotalHours,
                notes: payload.notes,
                leave_type: payload.leave_type,
                projects,
            };

            const backendDetails =
                data?.data ||
                data?.timesheet ||
                (data?.detail &&
                    typeof data.detail === "object" &&
                    !Array.isArray(data.detail)
                    ? data.detail
                    : null);

            const updatedDetails =
                backendDetails &&
                    typeof backendDetails === "object" &&
                    !Array.isArray(backendDetails)
                    ? {
                        ...submittedDetails,
                        ...backendDetails,
                        day_entry_id:
                            backendDetails?.day_entry_id ||
                            submittedDetails.day_entry_id,
                        work_date: submittedDetails.work_date,
                        // Keep the status selected in the Save flow.
                        // Do not let a stale/different PUT response overwrite it.
                        status: submittedDetails.status,
                        total_hours:
                            submittedDetails.total_hours,
                        notes:
                            backendDetails?.notes ??
                            submittedDetails.notes,
                        leave_type:
                            backendDetails?.leave_type ??
                            submittedDetails.leave_type,
                        projects:
                            Array.isArray(backendDetails?.projects)
                                ? backendDetails.projects
                                : submittedDetails.projects,
                    }
                    : submittedDetails;

            // Immediately reflect the status selected in the Save dropdown
            // in this same popup. Reopening the popup is not required.
            setActionStatus(normalizedStatus);
            skipNextDetailsSyncRef.current = true;
            setEditableDetails(updatedDetails);
            setIsEditing(false);
            setActionMessage("");
            setSuccessPopupType("saved");
            setShowSuccessPopup(true);

            // Immediately send the saved status/details to the parent.
            // This updates the table before the popup is closed and does
            // not wait for the background persistence verification GET.
            onSaved?.(updatedDetails);

            try {
                // API: GET /timesheet/admin/timesheet/day/:dayEntryId
                // Purpose: Verify that the saved timesheet is persisted in the backend.
                let verifyResponse;

                try {
                    verifyResponse = await api.get(
                        `/timesheet/admin/timesheet/day/${encodeURIComponent(
                            dayEntryId
                        )}`,
                        {
                            params: { _ts: Date.now() },
                            headers: { "Cache-Control": "no-cache" },
                        }
                    );
                } catch (verifyError) {
                    throw new Error(
                        `Unable to verify saved timesheet (${verifyError?.response?.status || "unknown"})`
                    );
                }

                const verifiedData = verifyResponse.data;

                const verifiedDetails =
                    verifiedData?.data ||
                    verifiedData?.timesheet ||
                    (verifiedData?.detail &&
                        typeof verifiedData.detail === "object" &&
                        !Array.isArray(verifiedData.detail)
                        ? verifiedData.detail
                        : verifiedData);

                if (
                    verifiedDetails &&
                    typeof verifiedDetails === "object" &&
                    !Array.isArray(verifiedDetails)
                ) {
                    const verifiedHours = Number(
                        verifiedDetails?.total_hours
                    );
                    const submittedHours = Number(
                        updatedDetails?.total_hours
                    );

                    const hoursMismatch =
                        Number.isFinite(verifiedHours) &&
                        Number.isFinite(submittedHours) &&
                        verifiedHours !== submittedHours;

                    if (hoursMismatch) {
                        console.warn(
                            "[TIMESHEET SAVE] Backend GET returned different total_hours after PUT.",
                            {
                                submitted: submittedHours,
                                backend: verifiedHours,
                                dayEntryId,
                            }
                        );
                    } else {
                        console.log(
                            "[TIMESHEET SAVE] Persistence verification passed.",
                            verifiedDetails
                        );
                    }
                }

                skipNextDetailsSyncRef.current = true;
                setEditableDetails(updatedDetails);
            } catch (verifyError) {
                console.error(
                    "[TIMESHEET SAVE] Persistence verification error:",
                    verifyError
                );

                skipNextDetailsSyncRef.current = true;
                setEditableDetails(updatedDetails);
            }

        } catch (err) {
            console.error(
                "Timesheet Update Error:",
                err
            );

            setEditError(
                err?.message ||
                "Unable to update timesheet."
            );
        } finally {
            setSaveLoading(false);
        }
    };

    // Refresh the latest day details after an action.
    const refreshDayAfterAction = async (fallbackDetails) => {
        try {
            // API: GET /timesheet/admin/timesheet/day/:dayEntryId
            // Purpose: Refresh the latest backend state after Approve/Reject.
            let response;

            try {
                response = await api.get(
                    `/timesheet/admin/timesheet/day/${encodeURIComponent(
                        dayEntryId
                    )}`,
                    {
                        params: { _ts: Date.now() },
                        headers: { "Cache-Control": "no-cache" },
                    }
                );
            } catch (refreshError) {
                throw new Error(
                    `Unable to refresh timesheet (${refreshError?.response?.status || "unknown"})`
                );
            }

            const data = response.data;
            const freshDetails = extractDayDetails(data);

            if (freshDetails && typeof freshDetails === "object") {
                return {
                    ...(fallbackDetails || {}),
                    ...freshDetails,
                    day_entry_id: freshDetails?.day_entry_id || dayEntryId,
                };
            }
        } catch (refreshError) {
            console.warn("[TIMESHEET ACTION] Fresh GET failed; using action result:", refreshError);
        }

        return fallbackDetails;
    };

    // Approve the selected timesheet through the API.
    const handleApprove = async () => {
        // Prevent approval after the timesheet is finalized.
        if (isFinalized) {
            return;
        }

        if (!dayEntryId || actionLoading) {
            return;
        }

        setActionLoading(true);
        setActionType("approve");
        setActionMessage("");
        setActionError("");

        try {
            // API: POST /timesheet/admin/timesheet/day/:dayEntryId/approve
            // Purpose: Approve the selected timesheet day.
            let response;
            try {
                response = await api.post(
                    `/timesheet/admin/timesheet/day/${encodeURIComponent(
                        dayEntryId
                    )}/approve`
                );
            } catch (error) {
                const data = error?.response?.data;
                const status = error?.response?.status;

                let message =
                    `Unable to approve timesheet (${status || "unknown"})`;

                if (typeof data?.detail === "string") {
                    message = data.detail;
                } else if (Array.isArray(data?.detail)) {
                    message = data.detail
                        .map((item) => item?.msg || item)
                        .join(", ");
                }

                throw new Error(message);
            }

            const data = response.data;

            const approvedDetails = {
                ...(editableDetails || details || {}),
                day_entry_id: dayEntryId,
                status: "approved",
            };

            setActionStatus("approved");
            setEditableDetails(approvedDetails);
            skipNextDetailsSyncRef.current = true;
            onSaved?.(approvedDetails);
            setActionMessage("");
            setSuccessPopupType("approved");
            setShowSuccessPopup(true);
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

    // Open the rejection reason popup.
    const handleReject = () => {
        // Prevent rejection after the timesheet is finalized.
        if (isFinalized) {
            return;
        }

        if (!dayEntryId || actionLoading) {
            return;
        }

        setActionMessage("");
        setActionError("");
        setRejectReason("");
        setShowRejectPopup(true);
    };

    // Close the rejection popup and clear its data.
    const handleCancelReject = () => {
        if (actionLoading) {
            return;
        }

        setShowRejectPopup(false);
        setRejectReason("");
        setActionError("");
        setPendingRejectDayEntryId(null);
        setPendingRejectDetails(null);
    };

    // Submit the rejection reason through the API.
    const handleSubmitReject = async () => {
        // Prevent rejection submission after the timesheet is finalized.
        if (isFinalized) {
            return;
        }

        const rejectDayEntryId =
            pendingRejectDayEntryId || dayEntryId;

        if (!rejectDayEntryId || actionLoading) {
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
            // API: POST /timesheet/admin/timesheet/day/:dayEntryId/reject
            // Purpose: Reject the selected timesheet day with the entered reason.
            let response;

            try {
                response = await api.post(
                    `/timesheet/admin/timesheet/day/${encodeURIComponent(
                        rejectDayEntryId
                    )}/reject`,
                    {
                        reason: trimmedReason,
                    }
                );
            } catch (error) {
                const data = error?.response?.data;
                const status = error?.response?.status;

                let message =
                    `Unable to reject timesheet (${status || "unknown"})`;

                if (typeof data?.detail === "string") {
                    message = data.detail;
                } else if (Array.isArray(data?.detail)) {
                    message = data.detail
                        .map((item) => item?.msg || item)
                        .join(", ");
                }

                throw new Error(message);
            }

            const data = response.data;

            const rejectedDetails = {
                ...(pendingRejectDetails || editableDetails || details || {}),
                day_entry_id: rejectDayEntryId,
                status: "rejected",
                rejection_note: trimmedReason,
            };

            setActionStatus("rejected");
            setEditableDetails(rejectedDetails);
            skipNextDetailsSyncRef.current = true;
            onSaved?.(rejectedDetails);
            setActionMessage("");

            setShowRejectPopup(false);
            setRejectReason("");
            setPendingRejectDayEntryId(null);
            setPendingRejectDetails(null);

            setSuccessPopupType("rejected");
            setShowSuccessPopup(true);
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

    // Resolve the status shown in the modal.
    // A genuinely unlogged/missing day must always display UNLOGGED
    // until the admin submits the missing-day details.
    const displayStatus =
        actionStatus ||
        (isMissingDay && !missingDaySubmitted
            ? "unlogged"
            : status);

    // Get the display configuration for the current status.
    const displayStatusConfig =
        getStatusConfig(displayStatus);

    // Normalize the editable status for checks.
    const editableStatus = String(
        editableDetails?.status || status || ""
    )
        .toLowerCase()
        .trim();

    // Check whether the selected entry is a leave entry.
    const isLeaveStatus =
        editableStatus === "leave" ||
        editableStatus === "on_leave";

    // Approve / Reject do not depend on Edit/Save mode.
    // If a backend day entry ID already exists, actions are available
    // even when the day is shown as unlogged/missing.
    const canPerformActions =
        !isFinalized &&
        Boolean(dayEntryId);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:px-4 sm:py-6"
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
                className="relative flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-[12px] border border-[#e5d8d2] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-[8px] md:max-w-[640px] lg:max-w-[680px]"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                { }

                <div
                    className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#e8e0dc] bg-white px-4 py-4 sm:px-6 sm:py-5"
                >
                    <div>
                        <div className="flex items-center gap-2">
                            <h2
                                className="text-[17px] font-semibold text-[#0b1b35] sm:text-[20px]"
                            >
                                Timesheet Details
                            </h2>

                            {isFinalized && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-semibold text-slate-600">
                                    <LockKeyhole size={11} strokeWidth={2} />
                                    Locked
                                </span>
                            )}
                        </div>

                        <p
                            className="mt-1 text-[11px] text-[#7b8492]"
                        >
                            {isFinalized
                                ? "This timesheet is finalized and read-only."
                                : isEditing
                                    ? "Edit submitted work details"
                                    : "View submitted work details"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isEditing && !isFinalized && (
                            <button
                                type="button"
                                onClick={handleStartEdit}
                                disabled={
                                    actionLoading ||
                                    saveLoading ||
                                    loading ||
                                    (!details && !isMissingDay)
                                }
                                className="rounded-[4px] border border-[#6B2D1A] bg-white px-4 py-2 text-[10px] font-semibold text-[#6B2D1A] transition hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Edit
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            disabled={
                                actionLoading ||
                                saveLoading
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f6f8] text-[18px] text-[#566176] transition hover:bg-[#eceef2] hover:text-[#0b1b35] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            ×
                        </button>
                    </div>
                </div>

                { }

                <div
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
                >

                    <div
                        className="flex items-center gap-3 border-b border-[#eee7e3] pb-5"
                    >
                        {details?.avatar_url ||
                            employee?.avatar_url ? (
                            <img
                                src={`${API_BASE_URL}${details?.avatar_url ||
                                    employee?.avatar_url
                                    }`}
                                alt=""
                                className="h-11 w-11 rounded-full object-cover"
                                onError={(
                                    event
                                ) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />
                        ) : (
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[18px]"
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
                                className="text-[15px] font-semibold text-[#17243b]"
                            >
                                {details?.employee_name ||
                                    employee?.employee_name ||
                                    "--"}
                            </div>

                            <div
                                className="mt-1 text-[10px] text-[#7b8492]"
                            >
                                #
                                {details?.employee_code ||
                                    employee?.employee_code ||
                                    "--"}
                            </div>

                            {details?.role && (
                                <div
                                    className="mt-1 text-[10px] text-[#7b8492]"
                                >
                                    {details.role}
                                </div>
                            )}
                        </div>
                    </div>

                    {isFinalized && (
                        <div className="mt-5 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                                <LockKeyhole size={17} strokeWidth={2} />
                            </div>

                            <div className="min-w-0">
                                <div className="text-[11px] font-semibold text-[#17243b]">
                                    Timesheet Finalized
                                </div>
                                <div className="mt-0.5 text-[10px] leading-4 text-[#7b8492]">
                                    This timesheet is locked. No further edits or approval actions are available.
                                </div>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <DetailLoading />
                    )}

                    {!loading &&
                        error && (
                            <div
                                className="mt-5 rounded-[5px] border border-[#efb3b3] bg-[#fff5f5] px-4 py-4 text-[11px] text-[#b52323]"
                            >
                                {error}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        editableDetails && (
                            <>

                                <div
                                    className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3"
                                >
                                    <DetailInfo
                                        label="WORK DATE"
                                        value={formatDetailDate(
                                            editableDetails.work_date
                                        )}
                                    />

                                    <DetailInfo
                                        label="TOTAL HOURS"
                                        value={formatHours(
                                            editableDetails?.total_hours ??
                                            calculateTotalHours(
                                                editableDetails?.projects
                                            )
                                        )}
                                    />

                                    <div
                                        className="rounded-[5px] border border-[#e7e0dc] bg-[#fafafa] px-4 py-3"
                                    >
                                        <div
                                            className="mb-2 text-[9px] font-semibold tracking-[0.3px] text-[#7b8492]"
                                        >
                                            STATUS
                                        </div>

                                        {isEditing ? (
                                            <select
                                                value={
                                                    editableDetails?.status ||
                                                    ""
                                                }
                                                onChange={(event) =>
                                                    updateEditableField(
                                                        "status",
                                                        event.target.value
                                                    )
                                                }
                                                disabled={saveLoading}
                                                className="w-full rounded-[4px] border border-[#ded4cf] bg-white px-2 py-2 text-[12px] text-[#17243b] outline-none focus:border-[#6B2D1A]"
                                            >
                                                <option value="">
                                                    Select status
                                                </option>
                                                <option value="submitted">
                                                    Submitted
                                                </option>
                                                <option value="approved">
                                                    Approved
                                                </option>
                                                <option value="rejected">
                                                    Rejected
                                                </option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${displayStatusConfig.badge}`}
                                            >
                                                {
                                                    displayStatusConfig.label
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {isLeaveStatus && (
                                    <div
                                        className="mt-5 rounded-[5px] border border-[#e7e0dc] bg-[#fafafa] px-4 py-3"
                                    >
                                        <div
                                            className="mb-2 text-[9px] font-semibold tracking-[0.3px] text-[#7b8492]"
                                        >
                                            LEAVE TYPE
                                        </div>

                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editableDetails?.leave_type || ""}
                                                onChange={(event) =>
                                                    updateEditableField(
                                                        "leave_type",
                                                        event.target.value
                                                    )
                                                }
                                                disabled={saveLoading}
                                                placeholder="Enter leave type..."
                                                className="w-full rounded-[4px] border border-[#ded4cf] bg-white px-2 py-2 text-[11px] text-[#17243b] outline-none focus:border-[#6B2D1A]"
                                            />
                                        ) : (
                                            <div
                                                className="text-[13px] font-semibold text-[#17243b]"
                                            >
                                                {editableDetails?.leave_type || "--"}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {Array.isArray(
                                    editableDetails.projects
                                ) &&
                                    editableDetails.projects.length >
                                    0 && (
                                        <div
                                            className="mt-5 rounded-[5px] border border-[#e7e0dc] bg-white"
                                        >
                                            <div
                                                className="flex items-center justify-between gap-3 border-b border-[#eee7e3] bg-[#f8f6f2] px-4 py-3 text-[10px] font-semibold tracking-[0.3px] text-[#5b4b45]"
                                            >
                                                <span>PROJECT DETAILS</span>

                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAddProject}
                                                        disabled={saveLoading}
                                                        className="rounded-[4px] border border-[#4D8B4F] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#4D8B4F] transition hover:bg-[#f2faef] disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        + Add Project
                                                    </button>
                                                )}
                                            </div>

                                            <div
                                                className="divide-y divide-[#eee7e3]"
                                            >
                                                {editableDetails.projects.map(
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
                                                            projectNumber={index + 1}
                                                            isEditing={
                                                                isEditing
                                                            }
                                                            saveLoading={
                                                                saveLoading
                                                            }
                                                            timeValidationError={
                                                                timeValidationErrors?.[index]
                                                            }
                                                            fieldErrors={
                                                                projectFieldErrors?.[index] || {}
                                                            }
                                                            canRemove={
                                                                isEditing &&
                                                                Array.isArray(editableDetails?.projects) &&
                                                                editableDetails.projects.length > 1
                                                            }
                                                            onRemove={() =>
                                                                handleRemoveProject(index)
                                                            }
                                                            onChange={(
                                                                field,
                                                                value
                                                            ) =>
                                                                updateProjectField(
                                                                    index,
                                                                    field,
                                                                    value
                                                                )
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {Array.isArray(
                                    editableDetails.activity_descriptions
                                ) &&
                                    editableDetails
                                        .activity_descriptions
                                        .length >
                                    0 && (
                                        <div
                                            className="mt-5 rounded-[5px] border border-[#e7e0dc] bg-white"
                                        >
                                            <div
                                                className="border-b border-[#eee7e3] bg-[#f8f6f2] px-4 py-3 text-[10px] font-semibold tracking-[0.3px] text-[#5b4b45]"
                                            >
                                                ACTIVITY
                                            </div>

                                            <div
                                                className="space-y-2 px-4 py-4"
                                            >
                                                {editableDetails.activity_descriptions.map(
                                                    (
                                                        activity,
                                                        index
                                                    ) => (
                                                        <div
                                                            key={
                                                                index
                                                            }
                                                            className="flex items-start gap-2 text-[11px] text-[#3d4655]"
                                                        >
                                                            <span
                                                                className="mt-[2px] flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#f2faef] text-[9px] font-bold text-[#28612d]"
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

                                {String(
                                    editableDetails?.status || status || ""
                                )
                                    .toLowerCase()
                                    .trim() === "rejected" &&
                                    editableDetails.rejection_note && (
                                        <div
                                            className="mt-5 rounded-[5px] border border-[#efb3b3] bg-[#fff5f5] px-4 py-4"
                                        >
                                            <div
                                                className="mb-2 text-[9px] font-bold tracking-[0.3px] text-[#b52323]"
                                            >
                                                REJECTION NOTE
                                            </div>

                                            <div
                                                className="text-[11px] leading-5 text-[#7b3030]"
                                            >
                                                {
                                                    editableDetails.rejection_note
                                                }
                                            </div>
                                        </div>
                                    )}
                            </>
                        )}

                    {actionError &&
                        !showRejectPopup && (
                            <div
                                className="mt-5 rounded-[5px] border border-[#efb3b3] bg-[#fff5f5] px-4 py-3 text-[11px] font-medium text-[#b52323]"
                            >
                                {actionError}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        !details && (
                            <div
                                className="py-10 text-center text-[12px] text-[#8b94a3]"
                            >
                                No timesheet details
                                available.
                            </div>
                        )}
                </div>

                { }

                <div
                    className="flex flex-shrink-0 flex-col gap-3 border-t border-[#eee7e3] bg-[#fcfcfd] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
                >
                    {isEditing ? (
                        <>
                            <div className="flex w-full items-center gap-2 sm:w-auto">
                                {editError && (
                                    <span className="max-w-[260px] text-[10px] font-medium text-[#b52323]">
                                        {editError}
                                    </span>
                                )}
                            </div>

                            <div className="flex w-full items-center gap-2 sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={saveLoading}
                                    className="flex-1 rounded-[4px] border border-[#ded4cf] bg-white px-4 py-2.5 text-[10px] font-semibold text-[#3d332f] transition hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-5 sm:py-2"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    disabled={
                                        saveLoading ||
                                        Object.keys(timeValidationErrors).length > 0
                                    }
                                    className="flex-1 rounded-[4px] bg-[#4D8B4F] px-4 py-2.5 text-[10px] font-semibold text-white transition hover:bg-[#3f7541] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-5 sm:py-2"
                                >
                                    {saveLoading
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {!isFinalized && (
                                <div className="flex w-full items-center gap-2 sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={handleApprove}
                                        disabled={
                                            actionLoading ||
                                            saveLoading ||
                                            !canPerformActions ||
                                            actionStatus ===
                                            "approved"
                                        }
                                        className="rounded-[4px] bg-[#4D8B4F] px-5 py-2 text-[10px] font-semibold text-white transition hover:bg-[#3f7541] disabled:cursor-not-allowed disabled:opacity-60"
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
                                            saveLoading ||
                                            !canPerformActions ||
                                            actionStatus ===
                                            "rejected"
                                        }
                                        className="rounded-[4px] border border-[#6B2D1A] bg-white px-5 py-2 text-[10px] font-semibold text-[#6B2D1A] transition hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {actionLoading &&
                                            actionType ===
                                            "reject"
                                            ? "Rejecting..."
                                            : "Reject"}
                                    </button>
                                </div>
                            )}

                            {isFinalized && (
                                <div className="flex w-full items-center gap-2 sm:w-auto">
                                    <div className="flex items-center gap-2 rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-medium text-slate-500">
                                        <LockKeyhole size={12} strokeWidth={2} />
                                        Read-only
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={
                                    actionLoading ||
                                    saveLoading
                                }
                                className="rounded-[4px] border border-[#ded4cf] bg-white px-5 py-2 text-[10px] font-semibold text-[#3d332f] transition hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Close
                            </button>
                        </>
                    )}
                </div>

                { }

                {showSuccessPopup && (
                    <div
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4"
                    >
                        <div
                            className="w-full max-w-[320px] rounded-xl bg-white p-5 text-center shadow-[0_20px_60px_rgba(15,23,42,0.25)] sm:p-6"
                            onMouseDown={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <p className="mb-4 font-semibold text-green-600">
                                {successPopupType === "approved"
                                    ? "Timesheet approved successfully."
                                    : successPopupType === "rejected"
                                        ? "Timesheet rejected successfully."
                                        : "Changes saved successfully."}
                            </p>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSuccessPopup(false);
                                        setSuccessPopupType("");
                                    }}
                                    className="rounded bg-green-800 px-4 py-2 text-white cursor-pointer hover:bg-green-700"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showRejectPopup && (
                    <div
                        className="absolute inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-[2px] sm:items-center sm:px-5"
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
                            className="w-full rounded-t-[12px] border border-[#e5d8d2] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] sm:max-w-[420px] sm:rounded-[8px]"
                            onMouseDown={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                        >

                            <div
                                className="border-b border-[#eee7e3] px-5 py-4"
                            >
                                <h3
                                    className="text-[16px] font-semibold text-[#0b1b35]"
                                >
                                    Reject Timesheet
                                </h3>

                                <p
                                    className="mt-1 text-[10px] text-[#7b8492]"
                                >
                                    Please provide a
                                    reason for rejecting
                                    this timesheet.
                                </p>
                            </div>

                            <div className="px-5 py-4">
                                <label
                                    className="mb-2 block text-[10px] font-semibold text-[#5b4b45]"
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
                                    className="w-full resize-none rounded-[5px] border border-[#ded4cf] bg-white px-3 py-3 text-[11px] text-[#17243b] outline-none transition placeholder:text-[#a0a6b1] focus:border-[#6B2D1A] focus:ring-1 focus:ring-[#6B2D1A]/20 disabled:cursor-not-allowed disabled:bg-[#f5f6f8]"
                                />

                                {actionError && (
                                    <div
                                        className="mt-2 text-[10px] font-medium text-[#b52323]"
                                    >
                                        {actionError}
                                    </div>
                                )}
                            </div>

                            <div
                                className="flex justify-end gap-2 border-t border-[#eee7e3] bg-[#fcfcfd] px-5 py-4"
                            >
                                <button
                                    type="button"
                                    onClick={
                                        handleCancelReject
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    className="w-full rounded-[4px] border border-[#ded4cf] bg-white px-5 py-2.5 text-[10px] font-semibold text-[#3d332f] transition hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
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
                                    className="rounded-[4px] bg-[#6B2D1A] px-5 py-2 text-[10px] font-semibold text-white transition hover:bg-[#542315] disabled:cursor-not-allowed disabled:opacity-60"
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

// Render a reusable detail information card.
function DetailInfo({
    label,
    value,
}) {
    return (
        <div
            className="rounded-[5px] border border-[#e7e0dc] bg-[#fafafa] px-4 py-3"
        >
            <div
                className="mb-2 text-[9px] font-semibold tracking-[0.3px] text-[#7b8492]"
            >
                {label}
            </div>

            <div
                className="text-[13px] font-semibold text-[#17243b]"
            >
                {value}
            </div>
        </div>
    );
}

// Render one project in view or edit mode.
function ProjectItem({
    project,
    projectNumber,
    isEditing = false,
    saveLoading = false,
    timeValidationError = "",
    fieldErrors = {},
    canRemove = false,
    onRemove,
    onChange,
}) {
    const fieldClass = `w-full rounded-[4px] border border-[#ded4cf] bg-white px-2 py-2 text-[11px] text-[#17243b] outline-none focus:border-[#6B2D1A] disabled:cursor-not-allowed disabled:bg-[#f5f6f8]`;

    if (!isEditing) {
        return (
            <div className="px-4 py-4">
                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                    <DetailInfo
                        label={`PROJECT ${projectNumber}`}
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

                    <DetailInfo
                        label="DESCRIPTION"
                        value={
                            project?.description ||
                            "--"
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[10px] font-semibold tracking-[0.3px] text-[#5b4b45]">
                    PROJECT {projectNumber}
                </div>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={saveLoading}
                        className="text-[10px] cursor-pointer font-medium text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Remove Project
                    </button>
                )}
            </div>

            <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
                <EditField
                    label={`PROJECT ${projectNumber}`}
                    value={project?.project_name || ""}
                    onChange={(value) =>
                        onChange("project_name", value)
                    }
                    disabled={saveLoading}
                    error={fieldErrors?.project_name}
                />

                <EditField
                    label="TASK"
                    value={project?.task_name || ""}
                    onChange={(value) =>
                        onChange("task_name", value)
                    }
                    disabled={saveLoading}
                    error={fieldErrors?.task_name}
                />

                <EditField
                    label="START TIME"
                    type="time"
                    value={project?.start_time || ""}
                    onChange={(value) =>
                        onChange("start_time", value)
                    }
                    disabled={saveLoading}
                    error={fieldErrors?.start_time}
                />

                <EditField
                    label="END TIME"
                    type="time"
                    value={project?.end_time || ""}
                    onChange={(value) =>
                        onChange("end_time", value)
                    }
                    disabled={saveLoading}
                    error={fieldErrors?.end_time}
                />

                {timeValidationError &&
                    !fieldErrors?.start_time &&
                    !fieldErrors?.end_time && (
                        <div className="sm:col-span-2 -mt-1 text-[10px] font-medium text-[#b52323]">
                            {timeValidationError}
                        </div>
                    )}

                <EditField
                    label="HOURS"
                    type="number"
                    value={project?.hours ?? 0}
                    disabled={true}
                />

                <div
                    className="rounded-[5px] border border-[#e7e0dc] bg-[#fafafa] px-4 py-3 sm:col-span-2"
                >
                    <div
                        className="mb-2 text-[9px] font-semibold tracking-[0.3px] text-[#7b8492]"
                    >
                        DESCRIPTION
                    </div>

                    <textarea
                        rows={3}
                        value={
                            project?.description || ""
                        }
                        onChange={(event) =>
                            onChange(
                                "description",
                                event.target.value
                            )
                        }
                        disabled={saveLoading}
                        className={fieldClass}
                        placeholder="Enter description..."
                    />
                </div>
            </div>
        </div>
    );
}

// Render a reusable editable input field.
function EditField({
    label,
    value,
    onChange,
    type = "text",
    disabled = false,
    error = "",
}) {
    return (
        <div
            className="rounded-[5px] border border-[#e7e0dc] bg-[#fafafa] px-4 py-3"
        >
            <div
                className="mb-2 text-[9px] font-semibold tracking-[0.3px] text-[#7b8492]"
            >
                {label}
            </div>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                disabled={disabled}
                aria-invalid={Boolean(error)}
                min={
                    type === "number"
                        ? "0"
                        : undefined
                }
                step={
                    type === "number"
                        ? "0.25"
                        : undefined
                }
                className={`w-full rounded-[4px] border bg-white px-3 py-2.5 text-[16px] text-[#17243b] outline-none transition focus:border-[#6B2D1A] disabled:cursor-not-allowed disabled:bg-[#f5f6f8] sm:px-2 sm:py-2 sm:text-[11px] ${error
                    ? "border-[#ef5555] focus:border-[#ef5555]"
                    : "border-[#ded4cf]"
                    }`}
            />

            {error && (
                <div className="mt-1.5 text-[10px] font-medium leading-4 text-[#b52323]">
                    {error}
                </div>
            )}
        </div>
    );
}

// Render the loading skeleton for modal details.
function DetailLoading() {
    return (
        <div className="mt-6 space-y-4">
            <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
                {[1, 2, 3].map(
                    (item) => (
                        <div
                            key={item}
                            className="h-[70px] animate-pulse rounded-[5px] bg-[#f3f4f6]"
                        />
                    )
                )}
            </div>

            <div
                className="h-[145px] animate-pulse rounded-[5px] bg-[#f3f4f6]"
            />
            <div
                className="h-[100px] animate-pulse rounded-[5px] bg-[#f3f4f6]"
            />
        </div>
    );
}

export default TimesheetDetailModal;