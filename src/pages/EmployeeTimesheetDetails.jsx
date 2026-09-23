import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  X,
  Pencil,
  Lock,
  Save,
  CheckCheck,
  Clock3,
  CalendarDays,
  AlertCircle,
  UserRound,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import TimesheetExport from "../container/admintimesheetmanagement/TimesheetExport";
import { FiLoader } from "react-icons/fi";
import api from "../../src/api/axios";
import WeeklyOverview from "../container/admintimesheetmanagement/WeeklyOverview";

// API endpoints
const API_ENDPOINTS = {
  calendar: (employeeCode, month) =>
    `/timesheet/admin/timesheet/employee/${encodeURIComponent(employeeCode)}/calendar?month=${encodeURIComponent(month)}`,

  edit: `/timesheet/admin/timesheet/employee/{employee_code}/day-edit`,
  adminSubmitMissingDay: `/timesheet/admin/timesheet/employee/{employee_code}/day/admin-submit`,
  bulkApprove: `/timesheet/admin/timesheet/employee/{employee_code}/month/bulk-approve`,
  finalize: `/timesheet/admin/timesheet/employee/{employee_code}/month/finalize`,

  // GET selected day details including project/task/time entries
  dayDetails: (dayEntryId) =>
    `/timesheet/admin/timesheet/day/${encodeURIComponent(dayEntryId)}`,

  // PUT selected day details including project/task/time entries
  updateDayDetails: (dayEntryId) =>
    `/timesheet/admin/timesheet/day/${encodeURIComponent(dayEntryId)}`,
};

const resolveEndpoint = (endpoint, params = {}) => {
  return Object.entries(params).reduce(
    (result, [key, value]) =>
      result.replace(`{${key}}`, encodeURIComponent(String(value))),
    endpoint
  );
};

const formatApiError = (error, fallback) => {
  const status = error?.status ?? error?.response?.status;

  if (status === 401) {
    return "Unauthorized. Please login again so the timesheet API can receive a valid token.";
  }

  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const emptyTimesheet = (year, monthIndex) => {
  const result = {};
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, monthIndex, day);
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    result[day] = {
      date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayEntryId: null,
      hours: 0,
      status: isWeekend ? "weekend" : "unlogged",
      label: "",
      isWeekend,
    };
  }

  return result;
};

const mapCalendarResponse = (response, year, monthIndex) => {
  const mapped = emptyTimesheet(year, monthIndex);

  (response?.days || []).forEach((item) => {
    const day = Number(String(item?.date || "").slice(-2));
    if (!day) return;

    mapped[day] = {
      ...mapped[day],
      date: item.date,
      dayEntryId: item.day_entry_id ?? null,
      status: item.status || "unlogged",
      hours: item.hours == null ? 0 : Number(item.hours),
      label: item.label ?? "",
      notes: item.notes ?? "",
      isWeekend: Boolean(item.is_weekend),
      leaveType: item.leave_type ?? item.leaveType ?? "",
      holidayName: item.holiday_name ?? item.holidayName ?? (item.status === "holiday" ? item.label ?? "" : ""),
      weekendName: item.weekend_name ?? item.weekendName ?? "",
    };
  });

  return mapped;
};

const roundHours = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.round((numericValue + Number.EPSILON) * 100) / 100;
};

const formatHours = (value) => {
  const rounded = roundHours(value);
  return rounded.toFixed(2).replace(/\.?0+$/, "");
};

const getMonthParts = (monthValue) => {
  const [yearPart, monthPart] = String(monthValue || "").split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  return {
    year: Number.isFinite(year) && year >= 1900 ? year : new Date().getFullYear(),
    monthIndex:
      Number.isFinite(monthIndex) && monthIndex >= 0 && monthIndex <= 11
        ? monthIndex
        : new Date().getMonth(),
  };
};

const getDateForDay = (year, monthIndex, day) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const isPastDate = (dateValue) => {
  if (!dateValue) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  date.setHours(0, 0, 0, 0);

  return date < today;
};

const isTodayDate = (dateValue) => {
  if (!dateValue) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  date.setHours(0, 0, 0, 0);

  return date.getTime() === today.getTime();
};

const getInitials = (nameOrCode = "Employee") => {
  const value = String(nameOrCode || "Employee").trim();
  if (!value) return "EM";
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return value.slice(0, 2).toUpperCase();
};

const STATUS_CONFIG = {
  approved: {
    label: "Approved",
    shortLabel: "Approved",
    cardClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dayClass:
      "border-emerald-300 bg-emerald-50 hover:border-emerald-400",
    dotClass: "bg-emerald-500",
  },
  submitted: {
    label: "Submitted",
    shortLabel: "Submitted",
    cardClass: "border-amber-200 bg-amber-50 text-amber-700",
    dayClass:
      "border-amber-300 bg-amber-50 hover:border-amber-400",
    dotClass: "bg-amber-400",
  },
  pending: {
    label: "Submitted",
    shortLabel: "Submitted",
    cardClass: "border-amber-200 bg-amber-50 text-amber-700",
    dayClass:
      "border-amber-300 bg-amber-50 hover:border-amber-400",
    dotClass: "bg-amber-400",
  },
  rejected: {
    label: "Rejected",
    shortLabel: "Rejected",
    cardClass: "border-red-200 bg-red-50 text-red-700",
    dayClass:
      "border-red-300 bg-red-50 hover:border-red-400",
    dotClass: "bg-red-500",
  },

  unlogged: {
    label: "Unlogged",
    shortLabel: "Unlogged",
    cardClass: "border-slate-200 bg-slate-50 text-slate-600",
    dayClass:
      "border-slate-300 bg-slate-50 hover:border-slate-400",
    dotClass: "bg-slate-400",
  },

  leave: {
    label: "Leave",
    shortLabel: "Leave",
    cardClass: "border-sky-200 bg-sky-50 text-sky-700",
    dayClass:
      "border-sky-300 bg-sky-50 hover:border-sky-400",
    dotClass: "bg-sky-500",
  },

  holiday: {
    label: "Public Holiday",
    shortLabel: "Holiday",
    cardClass:
      "border-violet-200 bg-violet-50 text-violet-700",
    dayClass:
      "border-violet-300 bg-violet-50 hover:border-violet-400",
    dotClass: "bg-violet-500",
  },

  weekend: {
    label: "Weekend",
    shortLabel: "Weekend",
    cardClass:
      "border-slate-200 bg-slate-100 text-slate-500",
    dayClass:
      "border-slate-300 bg-slate-100 hover:border-slate-400",
    dotClass: "bg-slate-400",
  },
};

const FINALIZED_DAY_CLASS =
  "border-slate-200 bg-slate-100 text-slate-400";

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();

  return day === 0 ? 6 : day - 1;
};

export default function AdminTimesheetManagement({ employeeCode: employeeCodeProp = "" } = {}) {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const monthFromUrl = searchParams.get("month");
  const isValidMonthValue = /^\d{4}-(0[1-9]|1[0-2])$/.test(monthFromUrl || "");

  // Resolve employee code from available sources
  const resolveEmployeeCode = useCallback(() => {
    const propCode = String(employeeCodeProp || "").trim();
    if (propCode) return propCode;

    const routeCode =
      params?.employeeCode ||
      params?.employee_code ||
      params?.code ||
      params?.employeeId ||
      params?.id;

    if (routeCode) return String(routeCode).trim();

    const search = new URLSearchParams(location.search || "");
    const queryCode =
      search.get("employee_code") ||
      search.get("employeeCode") ||
      search.get("code");

    if (queryCode) return queryCode.trim();

    const stateCode =
      location.state?.employeeCode ||
      location.state?.employee_code ||
      location.state?.employee?.employee_code ||
      location.state?.employee?.code;

    if (stateCode) return String(stateCode).trim();

    return "";
  }, [employeeCodeProp, location.search, location.state, params]);

  const requestedEmployeeCode = resolveEmployeeCode();

  const initialMonthValue = monthFromUrl || "";
  const initialMonthParts = getMonthParts(initialMonthValue);

  const [year, setYear] = useState(initialMonthParts.year);
  const [month, setMonth] = useState(initialMonthParts.monthIndex);
  const [monthValue, setMonthValue] = useState(initialMonthValue);

  const [employee, setEmployee] = useState({
    id: null,
    code: requestedEmployeeCode,
    name: "",
    role: "",
    joiningDate: "",
    avatar: null,
  });

  const [timesheet, setTimesheet] = useState(
    emptyTimesheet(initialMonthParts.year, initialMonthParts.monthIndex)
  );

  const [savedTimesheet, setSavedTimesheet] = useState(
    emptyTimesheet(initialMonthParts.year, initialMonthParts.monthIndex)
  );

  const [monthlyHoursFromApi, setMonthlyHoursFromApi] = useState(0);
  const [targetHours, setTargetHours] = useState(160);
  const [progressPercentFromApi, setProgressPercentFromApi] = useState(0);

  const [selectedDay, setSelectedDay] = useState(null);
  const [editHours, setEditHours] = useState("");

  // Copy effort flow. Existing timesheet state and submission 
  const [showCopyEffortModal, setShowCopyEffortModal] = useState(false);
  const [copyTargetDays, setCopyTargetDays] = useState([]);
  const [isCopyingEffort, setIsCopyingEffort] = useState(false);

  // Details returned by the admin day-detail API.
  // Existing calendar/edit logic remains unchanged.
  const [dayDetails, setDayDetails] = useState(null);
  const [isDayDetailsLoading, setIsDayDetailsLoading] = useState(false);
  const [dayDetailsError, setDayDetailsError] = useState("");

  // Existing project details are read-only by default.
  // They become editable only after clicking the small Edit button.
  const [isEditingProjectDetails, setIsEditingProjectDetails] = useState(false);
  const [editableDayProjects, setEditableDayProjects] = useState([]);

  // Admin form used only when an unlogged day is selected.
  const [missingDayProjects, setMissingDayProjects] = useState([
    {
      project_name: "",
      task_name: "",
      start_time: "",
      end_time: "",
      description: "",
    },
  ]);
  const [missingDayProjectErrors, setMissingDayProjectErrors] = useState([{}]);
  const [isSubmittingMissingDay, setIsSubmittingMissingDay] = useState(false);

  const [isFinalized, setIsFinalized] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [contextError, setContextError] = useState(() => {
    if (!requestedEmployeeCode && !monthFromUrl) {
      return {
        title: "Timesheet information missing",
        message: "Employee code and month are required to load the timesheet.",
      };
    }
    if (!requestedEmployeeCode) {
      return {
        title: "Employee code missing",
        message: "A valid employee code is required to load this timesheet.",
      };
    }
    if (!monthFromUrl) {
      return {
        title: "Month missing",
        message: "A month is required to load this timesheet.",
      };
    }
    if (!isValidMonthValue) {
      return {
        title: "Invalid month",
        message: "The month must be provided in YYYY-MM format.",
      };
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [apiError, setApiError] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
  });

  const calendarDayRefs = useRef({});

  const scrollToElement = useCallback((element) => {
    if (!element) return;
    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    });
  }, []);

  const [activeEmployeeCode, setActiveEmployeeCode] = useState(requestedEmployeeCode);

  useEffect(() => {
    if (!requestedEmployeeCode || requestedEmployeeCode === activeEmployeeCode) return;

    setActiveEmployeeCode(requestedEmployeeCode);
    setAvatarError(false);
    setEmployee((prev) => ({
      ...prev,
      code: requestedEmployeeCode,
      name: "",
      role: "",
      joiningDate: "",
      avatar: null,
    }));
    setSelectedDay(null);
    setDayDetails(null);
    setDayDetailsError("");
    setIsDayDetailsLoading(false);
    setIsEditingProjectDetails(false);
    setEditableDayProjects([]);
    setShowCopyEffortModal(false);
    setCopyTargetDays([]);
    setSaveMessage("");
    setApiError("");
  }, [requestedEmployeeCode, activeEmployeeCode]);

  useEffect(() => {
    if (!requestedEmployeeCode && !monthFromUrl) {
      setContextError({
        title: "Timesheet information missing",
        message: "Employee code and month are required to load the timesheet.",
      });
      return;
    }

    if (!requestedEmployeeCode) {
      setContextError({
        title: "Employee code missing",
        message: "A valid employee code is required to load this timesheet.",
      });
      return;
    }

    if (!monthFromUrl) {
      setContextError({
        title: "Month missing",
        message: "A month is required to load this timesheet.",
      });
      return;
    }

    if (!isValidMonthValue) {
      setContextError({
        title: "Invalid month",
        message: "The month must be provided in YYYY-MM format.",
      });
      return;
    }

    setContextError(null);
  }, [requestedEmployeeCode, monthFromUrl, isValidMonthValue]);

  // Show popup only for API errors
  useEffect(() => {
    if (apiError) {
      setPopup({
        show: true,
        message: apiError,
        type: "error",
      });
    }
  }, [apiError]);

  // GET employee calendar
  const loadCalendar = useCallback(async () => {
    if (!activeEmployeeCode || !monthValue || !isValidMonthValue) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // API: GET employee calendar
      // Purpose: Load the selected employee monthly timesheet calendar.
      const response = await api.get(
        API_ENDPOINTS.calendar(activeEmployeeCode, monthValue)
      );

      const selectedMonthParts = getMonthParts(monthValue);
      const mappedTimesheet = mapCalendarResponse(
        response.data,
        selectedMonthParts.year,
        selectedMonthParts.monthIndex
      );

      setAvatarError(false);
      setEmployee({
        id: response.data?.employee_id ?? response.data?.id ?? null,
        code: response.data?.employee_code || activeEmployeeCode,
        name: response.data?.employee_name || "Unknown Employee",
        role: response.data?.role || "",
        joiningDate: response.data?.joining_date || response.data?.joiningDate || "",
        avatar: response.data?.avatar_url || response.data?.avatar || null,
      });
      setYear(selectedMonthParts.year);
      setMonth(selectedMonthParts.monthIndex);
      setTimesheet(mappedTimesheet);
      setSavedTimesheet(JSON.parse(JSON.stringify(mappedTimesheet)));
      setMonthlyHoursFromApi(Number(response.data?.monthly_hours || 0));
      setTargetHours(Number(response.data?.target_hours || 160));
      setProgressPercentFromApi(Number(response.data?.progress_percent || 0));
      setIsFinalized(Boolean(response.data?.is_finalized));
      setEditHours("");
    } catch (error) {
      setApiError(
        formatApiError(
          error,
          "Unable to load the employee timesheet calendar."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeEmployeeCode, monthValue, isValidMonthValue]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const daysInMonth = getDaysInMonth(year, month);

  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [firstDay, daysInMonth]);
  const statusCounts = useMemo(() => {
    const result = {
      approved: 0,
      pending: 0,
      rejected: 0,
      unlogged: 0,
      leave: 0,
      holiday: 0,
      weekend: 0,
    };

    Object.values(timesheet).forEach((item) => {
      const status = String(item?.status || "").trim().toLowerCase();

      if (status === "submitted" || status === "pending") {
        result.pending++;
      } else if (result[status] !== undefined) {
        result[status]++;
      }
    });

    return result;
  }, [timesheet]);

  const totalHours = useMemo(() => {
    return roundHours(
      Object.values(timesheet).reduce(
        (total, item) => total + Number(item.hours || 0),
        0
      )
    );
  }, [timesheet]);

  const monthLabel = useMemo(() => {
    const date = new Date(year, month, 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [year, month]);

  const displayTotalHours = roundHours(
    Number.isFinite(monthlyHoursFromApi) && monthlyHoursFromApi > 0
      ? monthlyHoursFromApi
      : totalHours
  );

  // Detect unsaved changes
  const unsavedDays = useMemo(() => {
    return Object.keys(timesheet).filter((day) =>
      JSON.stringify(timesheet[day]) !==
      JSON.stringify(savedTimesheet[day])
    );
  }, [timesheet, savedTimesheet]);

  const changeMonth = (amount) => {
    const [currentYear, currentMonth] = monthValue.split("-").map(Number);
    const date = new Date(currentYear, currentMonth - 1, 1);
    date.setMonth(date.getMonth() + amount);

    const nextMonthValue = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    setSelectedDay(null);
    setDayDetails(null);
    setDayDetailsError("");
    setIsDayDetailsLoading(false);
    setIsEditingProjectDetails(false);
    setEditableDayProjects([]);
    setShowCopyEffortModal(false);
    setCopyTargetDays([]);
    setSaveMessage("");
    setApiError("");
    setMonthValue(nextMonthValue);
  };

  const createEmptyProject = () => ({
    project_name: "",
    task_name: "",
    start_time: "",
    end_time: "",
    description: "",
  });

  const calculateTimeHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMinute) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMinute)
    ) {
      return 0;
    }

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (end <= start) return 0;

    return roundHours((end - start) / 60);
  };

  const getMissingDayTotalHours = () =>
    missingDayProjects.reduce(
      (total, project) =>
        total + calculateTimeHours(project.start_time, project.end_time),
      0
    );

  // GET the detailed timesheet entry for the selected day.
  // This is an additional read-only detail request; it does not replace
  // the existing monthly calendar API or any existing save/submit logic.
  const loadDayDetails = useCallback(async (dayEntryId) => {
    if (dayEntryId == null || dayEntryId === "") {
      setDayDetails(null);
      setDayDetailsError("");
      setIsDayDetailsLoading(false);
      return;
    }

    setIsDayDetailsLoading(true);
    setDayDetailsError("");

    try {
      const response = await api.get(API_ENDPOINTS.dayDetails(dayEntryId));
      const details = response.data || null;
      setDayDetails(details);
      setEditableDayProjects(
        Array.isArray(details?.projects)
          ? details.projects.map((project) => ({
            project_name: project?.project_name || "",
            task_name: project?.task_name || "",
            start_time: project?.start_time || "",
            end_time: project?.end_time || "",
            description: project?.description || "",
            hours: project?.hours ?? 0,
          }))
          : []
      );
      setIsEditingProjectDetails(false);
    } catch (error) {
      setDayDetails(null);
      setDayDetailsError(
        formatApiError(error, "Unable to load timesheet day details.")
      );
    } finally {
      setIsDayDetailsLoading(false);
    }
  }, []);

  const copyEffortSourceProjects = useMemo(() => {
    if (
      !selectedDay ||
      timesheet[selectedDay]?.status !== "approved" ||
      !Array.isArray(dayDetails?.projects)
    ) {
      return [];
    }

    return dayDetails.projects
      .map((project) => ({
        project_name: String(project?.project_name || "").trim(),
        task_name: String(project?.task_name || "").trim(),
        start_time: project?.start_time || "",
        end_time: project?.end_time || "",
        hours: roundHours(
          project?.hours ??
          calculateTimeHours(project?.start_time, project?.end_time)
        ),
        description: String(project?.description || "").trim(),
      }))
      .filter(
        (project) =>
          project.project_name ||
          project.task_name ||
          project.start_time ||
          project.end_time ||
          project.description
      );
  }, [dayDetails, selectedDay, timesheet]);

  const copyEffortTargetDays = useMemo(() => {
    return Object.entries(timesheet)
      .filter(([day, data]) => {
        return (
          Number(day) !== Number(selectedDay) &&
          data?.status === "unlogged" &&
          isPastDate(
            data?.date || getDateForDay(year, month, Number(day))
          )
        );
      })
      .map(([day, data]) => ({
        day: Number(day),
        data,
      }))
      .sort((a, b) => a.day - b.day);
  }, [selectedDay, timesheet]);

  const canCopyThisEffort =
    !isFinalized &&
    timesheet[selectedDay]?.status === "approved" &&
    !isDayDetailsLoading &&
    copyEffortSourceProjects.length > 0;

  const handleOpenCopyEffort = () => {
    if (!canCopyThisEffort) return;

    setCopyTargetDays([]);
    setSaveMessage("");
    setApiError("");
    setShowCopyEffortModal(true);
  };

  const handleCopyEffort = async () => {
    if (
      isFinalized ||
      isCopyingEffort ||
      !selectedDay ||
      timesheet[selectedDay]?.status !== "approved"
    ) {
      return;
    }

    if (copyTargetDays.length === 0) {
      setSaveMessage("Please select at least one unlogged day.");
      return;
    }

    if (copyEffortSourceProjects.length === 0) {
      setSaveMessage("No project effort is available to copy from this day.");
      return;
    }

    const totalHours = roundHours(
      copyEffortSourceProjects.reduce(
        (total, project) =>
          total +
          (Number(project.hours) ||
            calculateTimeHours(project.start_time, project.end_time)),
        0
      )
    );

    if (totalHours <= 0) {
      setSaveMessage("The approved day has no valid working hours to copy.");
      return;
    }

    if (totalHours > 12) {
      setSaveMessage(
        `The source day exceeds the 12 hour limit. Current total: ${formatHours(totalHours)}h`
      );
      return;
    }

    const endpoint = resolveEndpoint(API_ENDPOINTS.adminSubmitMissingDay, {
      employee_code: activeEmployeeCode,
    });

    setIsCopyingEffort(true);
    setSaveMessage("");
    setApiError("");

    let successCount = 0;
    let failedCount = 0;
    let firstError = null;

    try {
      // Use the existing admin-submit endpoint for every selected unlogged day.
      // No existing API or submission flow is replaced.
      for (const targetDay of copyTargetDays) {
        const targetData = timesheet[targetDay];

        if (targetData?.status !== "unlogged") {
          continue;
        }

        try {
          await api.post(endpoint, {
            work_date:
              targetData?.date ||
              getDateForDay(year, month, Number(targetDay)),
            projects: copyEffortSourceProjects.map((project) => ({
              project_name: project.project_name,
              task_name: project.task_name,
              start_time: project.start_time,
              end_time: project.end_time,
              hours: roundHours(
                project.hours ||
                calculateTimeHours(project.start_time, project.end_time)
              ),
              description: project.description,
            })),
          });

          successCount += 1;
        } catch (error) {
          failedCount += 1;
          if (!firstError) firstError = error;
        }
      }

      await loadCalendar();

      if (failedCount === 0 && successCount > 0) {
        setShowCopyEffortModal(false);
        setCopyTargetDays([]);
        setSaveMessage(
          `Effort copied and submitted successfully to ${successCount} unlogged day${successCount !== 1 ? "s" : ""}.`
        );
      } else if (successCount > 0 && failedCount > 0) {
        setSaveMessage(
          `Effort copied to ${successCount} day${successCount !== 1 ? "s" : ""}, but ${failedCount} day${failedCount !== 1 ? "s" : ""} failed.`
        );
        if (firstError) {
          setApiError(formatApiError(firstError, "Some selected days could not be submitted."));
        }
      } else if (failedCount > 0) {
        setApiError(
          formatApiError(firstError, "Unable to copy effort to the selected days.")
        );
        setSaveMessage("Copy & Submit failed.");
      }
    } catch (error) {
      setApiError(
        formatApiError(error, "Unable to copy effort to the selected days.")
      );
      setSaveMessage("Copy & Submit failed.");
    } finally {
      setIsCopyingEffort(false);
    }
  };

  const handleDayClick = (day, options = {}) => {
    if (!day || isFinalized) return;

    const data = timesheet[day];
    if (!data) return;

    setSelectedDay(day);
    setEditHours(data.hours || "");
    setSaveMessage("");
    setApiError("");
    setDayDetails(null);
    setDayDetailsError("");
    setIsEditingProjectDetails(false);
    setEditableDayProjects([]);

    // Admin can edit only past unlogged days.
    if (data.status === "unlogged" && isPastDate(data.date)) {
      setMissingDayProjects([createEmptyProject()]);
      setMissingDayProjectErrors([{}]);
    } else if (data.dayEntryId) {
      // Existing day: load project/task/time details using day_entry_id.
      loadDayDetails(data.dayEntryId);
    }

    if (options.scroll !== false) {
      scrollToElement(calendarDayRefs.current[day]);
    }
  };

  // Project detail edit mode handlers.
  // The current file does not define a project-detail write endpoint, so these
  // handlers only control the edit draft and keep the existing save/API logic untouched.
  const updateEditableProject = (index, field, value) => {
    setEditableDayProjects((prev) =>
      prev.map((project, projectIndex) =>
        projectIndex === index ? { ...project, [field]: value } : project
      )
    );
  };

  const cancelProjectDetailsEdit = () => {
    const projects = Array.isArray(dayDetails?.projects) ? dayDetails.projects : [];
    setEditableDayProjects(
      projects.map((project) => ({
        project_name: project?.project_name || "",
        task_name: project?.task_name || "",
        start_time: project?.start_time || "",
        end_time: project?.end_time || "",
        description: project?.description || "",
        hours: project?.hours ?? 0,
      }))
    );
    setIsEditingProjectDetails(false);
  };

  const saveProjectDetailsDraft = async () => {
    if (!dayDetails?.day_entry_id || isFinalized) return;

    const projects = editableDayProjects.map((project) => ({
      project_name: String(project?.project_name || "").trim(),
      task_name: String(project?.task_name || "").trim(),
      start_time: project?.start_time || "",
      end_time: project?.end_time || "",
      hours: calculateTimeHours(project?.start_time, project?.end_time),
      description: String(project?.description || "").trim(),
    }));

    const invalidProject = projects.find(
      (project) =>
        !project.project_name ||
        !project.task_name ||
        !project.start_time ||
        !project.end_time ||
        project.hours <= 0
    );

    if (invalidProject) {
      setSaveMessage("Please enter valid project, task, start time and end time details.");
      return;
    }

    const totalHours = roundHours(
      projects.reduce((total, project) => total + Number(project.hours || 0), 0)
    );

    try {
      setIsDayDetailsLoading(true);
      setDayDetailsError("");
      setSaveMessage("");

      const payload = {
        work_date: dayDetails?.work_date,
        status: dayDetails?.status || timesheet[selectedDay]?.status || "pending",
        notes: dayDetails?.notes || "",
        total_hours: totalHours,
        leave_type: dayDetails?.leave_type || "",
        projects,
      };

      const response = await api.put(
        API_ENDPOINTS.updateDayDetails(dayDetails.day_entry_id),
        payload
      );

      const savedDetails = response?.data || {
        ...dayDetails,
        total_hours: totalHours,
        projects,
      };

      setDayDetails(savedDetails);
      setEditableDayProjects(
        Array.isArray(savedDetails?.projects)
          ? savedDetails.projects.map((project) => ({
            project_name: project?.project_name || "",
            task_name: project?.task_name || "",
            start_time: project?.start_time || "",
            end_time: project?.end_time || "",
            description: project?.description || "",
            hours: project?.hours ?? calculateTimeHours(project?.start_time, project?.end_time),
          }))
          : projects
      );
      setIsEditingProjectDetails(false);
      setSaveMessage("Project details updated successfully");

      // Refresh the selected day's data so the saved values remain after a reload.
      await loadDayDetails(dayDetails.day_entry_id);
      await loadCalendar();
    } catch (error) {
      setSaveMessage(
        formatApiError(error, "Unable to save project details. Please try again.")
      );
    } finally {
      setIsDayDetailsLoading(false);
    }
  };

  // Build day edit payload
  const buildDayEditPayload = (day, overrides = {}) => {
    const data = timesheet[day];

    return {
      work_date: data?.date || getDateForDay(year, month, Number(day)),
      status: overrides.status ?? data?.status ?? "unlogged",
      hours: Number(overrides.hours ?? data?.hours ?? 0),
      leave_type: overrides.leave_type ?? data?.leaveType ?? "",
      notes: overrides.notes ?? data?.notes ?? data?.label ?? "",
    };
  };

  // PATCH day edit
  const patchEmployeeDays = async (days) => {
    const endpoint = resolveEndpoint(API_ENDPOINTS.edit, {
      employee_code: activeEmployeeCode,
    });

    // API: PATCH employee day entries
    // Purpose: Save editable timesheet day changes.
    return api.patch(endpoint, { days });
  };

  // Admin submits a genuinely unlogged day through the dedicated endpoint.
  const handleAdminSubmitMissingDay = async () => {
    if (!selectedDay || isFinalized || isSubmittingMissingDay) return;

    const currentDay = timesheet[selectedDay];
    if (currentDay?.status !== "unlogged") return;
    if (!isPastDate(currentDay?.date)) return;

    const projects = missingDayProjects.filter(
      (project) =>
        project.project_name.trim() ||
        project.task_name.trim() ||
        project.start_time ||
        project.end_time ||
        project.description.trim()
    );

    if (projects.length === 0) {
      setSaveMessage("Please add at least one project entry.");
      return;
    }

    const errors = projects.map(() => ({}));
    let hasErrors = false;

    projects.forEach((project, index) => {
      if (!project.start_time) {
        errors[index].start_time = "Start time is required.";
        hasErrors = true;
      }

      if (!project.end_time) {
        errors[index].end_time = "End time is required.";
        hasErrors = true;
      }

      if (project.start_time && project.end_time) {
        const calculatedHours = calculateTimeHours(
          project.start_time,
          project.end_time
        );

        if (calculatedHours <= 0) {
          errors[index].end_time =
            "End time must be greater than start time.";
          hasErrors = true;
        }

        if (calculatedHours > 12) {
          errors[index].end_time =
            "A single project cannot exceed 12 hours.";
          hasErrors = true;
        }
      }
    });

    setMissingDayProjectErrors(errors);

    if (hasErrors) {
      setSaveMessage("");
      return;
    }

    const totalHours = projects.reduce(
      (total, project) =>
        total + calculateTimeHours(project.start_time, project.end_time),
      0
    );

    if (totalHours <= 0) {
      setSaveMessage("Total working hours must be greater than 0.");
      return;
    }

    if (totalHours > 12) {
      setSaveMessage(
        `Total working hours cannot exceed 12 hours. Current total: ${formatHours(totalHours)}h`
      );
      return;
    }

    const endpoint = resolveEndpoint(API_ENDPOINTS.adminSubmitMissingDay, {
      employee_code: activeEmployeeCode,
    });

    setIsSubmittingMissingDay(true);
    setSaveMessage("");
    setApiError("");

    try {
      // API: POST admin missing-day submission
      // Purpose: Submit project details for an unlogged day.
      await api.post(endpoint, {
        work_date:
          currentDay?.date ||
          getDateForDay(year, month, Number(selectedDay)),
        projects: projects.map((project) => ({
          project_name: project.project_name.trim(),
          task_name: project.task_name.trim(),
          start_time: project.start_time,
          end_time: project.end_time,
          hours: roundHours(calculateTimeHours(project.start_time, project.end_time)),
          description: project.description.trim(),
        })),
      });

      await loadCalendar();

      setMissingDayProjects([createEmptyProject()]);
      setMissingDayProjectErrors([{}]);
      setSelectedDay(null);
      setSaveMessage("Missing day submitted successfully.");
    } catch (error) {
      setApiError(
        formatApiError(error, "Unable to submit the missing day.")
      );
      setSaveMessage("Missing day submission failed.");
    } finally {
      setIsSubmittingMissingDay(false);
    }
  };

  // Save selected day
  const handleSaveDay = async () => {
    if (!selectedDay || isFinalized || isEditingDay) return;

    const currentDay = timesheet[selectedDay];
    if (currentDay?.status === "unlogged") return;
    if (["holiday", "weekend"].includes(currentDay?.status)) return;

    const numericHours = Number(editHours);
    if (Number.isNaN(numericHours) || numericHours < 0 || numericHours > 12) {
      setSaveMessage("Enter valid working hours between 0 and 12");
      return;
    }

    setTimesheet((prev) => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], hours: numericHours },
    }));

    setIsEditingDay(true);
    setSaveMessage("");
    setApiError("");

    try {
      await patchEmployeeDays([
        buildDayEditPayload(selectedDay, { hours: numericHours }),
      ]);
      setSaveMessage(
        currentDay?.status === "approved"
          ? "Day approved successfully"
          : "Day updated successfully"
      );
      await loadCalendar();
    } catch (error) {
      setApiError(formatApiError(error, "Unable to update this day."));
      setSaveMessage("Day update failed");
    } finally {
      setIsEditingDay(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedDay || isFinalized) return;

    if (!["approved", "rejected"].includes(newStatus)) return;

    const currentDay = timesheet[selectedDay];

    if (
      currentDay?.status === "holiday" ||
      currentDay?.status === "weekend"
    )
      return;

    setTimesheet((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        status: newStatus,
        hours: prev[selectedDay].hours,
      },
    }));
  };

  // POST bulk approve
  const handleBulkApprove = async () => {
    if (isFinalized || isSaving || (statusCounts.pending + statusCounts.submitted) === 0) return;

    setIsSaving(true);
    setApiError("");
    setSaveMessage("");

    try {
      const endpoint = resolveEndpoint(API_ENDPOINTS.bulkApprove, {
        employee_code: activeEmployeeCode,
      });

      // API: POST bulk approve
      // Purpose: Approve all pending days for the selected month.
      await api.post(endpoint, { month: monthValue });

      setSaveMessage("All submitted days have been approved");
      await loadCalendar();
    } catch (error) {
      setApiError(formatApiError(error, "Unable to bulk approve this timesheet."));
      setSaveMessage("Bulk approval failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Finalize validation: only unresolved working-day statuses should block finalization.
  // Approved, Holiday, Leave, Unpaid Leave and Weekend are valid for finalization.
  const getFinalizeBlockingDays = () => {
    const allowedStatuses = new Set([
      "approved",
      "holiday",
      "leave",
      "unpaid_leave",
      "unpaid-leave",
      "unpaid leave",
      "weekend",
    ]);

    return Object.values(timesheet).filter((item) => {
      const status = String(item?.status || "unlogged")
        .trim()
        .toLowerCase();
      return !allowedStatuses.has(status);
    });
  };

  const handleOpenFinalizeModal = () => {
    if (isFinalized || isFinalizing || isSaving) return;

    const blockingDays = getFinalizeBlockingDays();

    if (blockingDays.length > 0) {
      const groupedDays = blockingDays.reduce((groups, item) => {
        const rawStatus = String(item?.status || "unlogged")
          .trim()
          .toLowerCase();
        const statusKey =
          rawStatus === "pending" || rawStatus === "submitted"
            ? "submitted"
            : rawStatus === "unlogged"
              ? "unlogged"
              : rawStatus === "rejected"
                ? "rejected"
                : rawStatus;

        if (!groups[statusKey]) groups[statusKey] = [];
        groups[statusKey].push(item?.date || "Unknown date");
        return groups;
      }, {});

      setApiError("");
      setPopup({
        show: true,
        type: "finalize-error",
        message: "Cannot Finalize Timesheet",
        details: groupedDays,
      });
      return;
    }

    setShowFinalizeModal(true);
  };

  // POST finalize month
  const handleFinalize = async () => {
    if (isFinalized || isFinalizing) return;

    const blockingDays = getFinalizeBlockingDays();
    if (blockingDays.length > 0) {
      setShowFinalizeModal(false);
      setApiError(
        `Cannot finalize this timesheet. Please resolve ${blockingDays.length} unresolved day${blockingDays.length !== 1 ? "s" : ""} first.`
      );
      return;
    }

    setIsFinalizing(true);
    setApiError("");
    setSaveMessage("");

    try {
      const endpoint = resolveEndpoint(API_ENDPOINTS.finalize, {
        employee_code: activeEmployeeCode,
      });

      // API: POST finalize month
      // Purpose: Finalize the employee timesheet for the selected month.
      await api.post(endpoint, { month: monthValue });

      setShowFinalizeModal(false);
      setSelectedDay(null);
      setSaveMessage(`${monthLabel} has been finalized successfully`);

      await loadCalendar();
    } catch (error) {
      setApiError(formatApiError(error, "Unable to finalize this timesheet."));
    } finally {
      setIsFinalizing(false);
    }
  };

  // Save changed editable days
  const handleSaveChanges = async () => {
    if (isFinalized || isSaving || isEditingDay) return;

    const changedDays = Object.keys(timesheet).filter(
      (day) => JSON.stringify(timesheet[day]) !== JSON.stringify(savedTimesheet[day])
    );

    if (changedDays.length === 0) {
      setSaveMessage("No changes to save");
      return;
    }

    const editableChangedDays = changedDays.filter(
      (day) => !["weekend", "holiday", "leave", "unlogged"].includes(timesheet[day]?.status)
    );

    if (editableChangedDays.length === 0) {
      setSaveMessage("No editable changes to save");
      return;
    }

    const invalidDay = editableChangedDays.find((day) => {
      const hours = Number(timesheet[day]?.hours ?? 0);
      return Number.isNaN(hours) || hours < 0 || hours > 12;
    });

    if (invalidDay) {
      setSaveMessage(`Invalid hours for ${timesheet[invalidDay]?.date || `day ${invalidDay}`}`);
      return;
    }

    setIsSaving(true);
    setApiError("");
    setSaveMessage("");

    try {
      await patchEmployeeDays(
        editableChangedDays.map((day) => buildDayEditPayload(day))
      );

      setSaveMessage(
        `${editableChangedDays.length} day${editableChangedDays.length !== 1 ? "s" : ""} saved successfully`
      );
      await loadCalendar();
    } catch (error) {
      setApiError(formatApiError(error, "Unable to save timesheet changes."));
      setSaveMessage("Save failed");
    } finally {
      setIsSaving(false);
    }
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {contextError && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle size={21} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-slate-900">
                  {contextError.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {contextError.message}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="text-xs leading-5 text-amber-800">
                Please open the timesheet from a valid employee and month context, then try again.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {isLoading && !contextError && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
          <div className="p-6 flex flex-col items-center gap-3">
            <FiLoader className="animate-spin text-4xl text-green-700" />

            <p className="text-gray-700 font-medium">
              Please wait...
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white px-4 py-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1400px]">

          {/* ===================================================
            PAGE HEADER
        =================================================== */}

          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">

              {/* BACK BUTTON */}
              <button
                type="button"
                onClick={() => window.history.back()}
                title="Back to Monthly View"
                aria-label="Back to Monthly View"
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-[#002B5B] hover:shadow cursor-pointer"
              >
                <ChevronLeft
                  size={18}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
              </button>

              {/* TITLE */}
              <div>
                <h1 className="text-3xl font-bold text-[#002B5B]">
                  Timesheet Management
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Review, edit and finalize employee monthly
                  timesheets.
                </p>
              </div>

            </div>

            {isFinalized && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
                <Lock size={16} />
                {monthLabel} Finalized
              </div>
            )}
          </div>

          {/* ===================================================
            EMPLOYEE SUMMARY
        =================================================== */}

          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              {/* PROFILE */}

              <div className="flex items-center gap-3">

                <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-emerald-50">
                  {employee.avatar && !avatarError ? (
                    <img
                      src={employee.avatar}
                      alt={employee.name || employee.code}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-sm font-bold tracking-wide text-emerald-700">
                      {getInitials(employee.name || employee.code)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">

                    <h2 className="text-base font-semibold text-slate-900">
                      {employee.name || employee.code}
                    </h2>

                    {isFinalized && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                        <Lock size={11} />
                        Locked
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {employee.role || "Employee"}{employee.joiningDate ? ` • ${employee.joiningDate}` : ""}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                    Employee Code: {employee.code}
                  </p>
                </div>
              </div>

              {/* STATUS CARDS */}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">

                <SummaryCard
                  title="Approved"
                  value={statusCounts.approved}
                  config={STATUS_CONFIG.approved}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Pending"
                  value={statusCounts.pending}
                  config={STATUS_CONFIG.pending}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Rejected"
                  value={statusCounts.rejected}
                  config={STATUS_CONFIG.rejected}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Unlogged"
                  value={statusCounts.unlogged}
                  config={STATUS_CONFIG.unlogged}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Leave"
                  value={statusCounts.leave}
                  config={STATUS_CONFIG.leave}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Holidays"
                  value={statusCounts.holiday}
                  config={STATUS_CONFIG.holiday}
                  finalized={isFinalized}
                />

              </div>
            </div>
          </div>

          <WeeklyOverview
            calendarDays={calendarDays}
            timesheet={timesheet}
            year={year}
            month={month}
            monthLabel={monthLabel}
            isFinalized={isFinalized}
            handleDayClick={handleDayClick}
            formatHours={formatHours}
            resetKey={`${activeEmployeeCode}-${monthValue}`}
          />

          {/* ===================================================
            MAIN CONTENT
        =================================================== */}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">

            {/* =================================================
              CALENDAR
          ================================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              {/* HEADER */}

              <div className="mb-3 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {monthLabel}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {isFinalized
                      ? "This month has been finalized and is read-only."
                      : "Click a day to view or edit timesheet details."}
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={handleOpenCopyEffort}
                    disabled={!canCopyThisEffort}
                    title={
                      canCopyThisEffort
                        ? "Copy this approved day's effort to unlogged days"
                        : "Select an approved day with project details first"
                    }
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Copy size={14} />
                    Copy This Effort
                  </button>

                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    disabled={isLoading}
                    className="flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    disabled={isLoading}
                    className="flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>

                </div>
              </div>

              {/* WEEK DAYS */}

              <div className="mb-1 grid w-full grid-cols-7 gap-0.5 sm:gap-1.5">

                {[
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                  "SAT",
                  "SUN",
                ].map((day) => (
                  <div
                    key={day}
                    className="min-w-0 py-1.5 text-center text-[8px] font-medium tracking-normal text-slate-400 sm:text-[10px] sm:tracking-wide"
                  >
                    {day}
                  </div>
                ))}

              </div>

              {/* CALENDAR */}

              <div className="grid w-full grid-cols-7 gap-0.5 sm:gap-1.5">

                {calendarDays.map((day, index) => {

                  if (!day) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[58px] sm:min-h-[72px]"
                      />
                    );
                  }

                  const data = timesheet[day];

                  const config =
                    STATUS_CONFIG[data?.status] ||
                    STATUS_CONFIG.unlogged;

                  const isSelected =
                    selectedDay === day;

                  // Highlight today only when no other day is selected
                  const isToday =
                    isTodayDate(getDateForDay(year, month, day));

                  const showTodayHighlight =
                    isToday && (selectedDay === null || selectedDay === day);

                  return (
                    <button
                      key={day}
                      ref={(element) => {
                        calendarDayRefs.current[day] = element;
                      }}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`relative flex min-h-[58px] cursor-pointer min-w-0 w-full flex-col items-center justify-between rounded-lg border p-1 text-center transition-all sm:min-h-[72px] sm:p-2 ${isFinalized
                          ? `${FINALIZED_DAY_CLASS} cursor-default`
                          : config.dayClass
                        } ${showTodayHighlight && !isFinalized
                          ? "ring-2 ring-emerald-500/80 ring-inset"
                          : ""
                        } ${isSelected && !isFinalized && !isToday
                          ? "ring-2 ring-slate-900 ring-offset-1"
                          : ""
                        }`}
                    >

                      {/* STATUS DOT */}

                      <div className="flex w-full justify-end">

                        {!isFinalized ? (
                          <span
                            className={`h-2 w-2 rounded-full ${config.dotClass}`}
                          />
                        ) : (
                          <Lock
                            size={12}
                            className="text-slate-400"
                          />
                        )}

                      </div>

                      {/* DAY */}

                      <div>

                        <p
                          className={`text-[12px] font-semibold leading-none sm:text-sm ${isFinalized ? "text-slate-400" : "text-slate-800"}`}
                        >
                          {day}
                        </p>

                        {data?.status === "holiday" ? (
                          <div className="mt-1">
                            <p
                              className={`text-[7px] font-medium leading-[9px] sm:text-[10px] sm:leading-normal ${isFinalized ? "text-slate-400" : "text-violet-600"}`}
                            >
                              Public Holiday
                            </p>
                            {!isFinalized && data?.holidayName && (
                              <p className="mt-0.5 max-w-full break-words text-[7px] font-medium leading-[8px] text-violet-500 sm:max-w-[90px] sm:truncate sm:text-[9px] sm:leading-normal">
                                {data.holidayName}
                              </p>
                            )}
                          </div>
                        ) : data?.status === "weekend" ? (
                          <p
                            className={`mt-1 max-w-full text-[7px] font-medium leading-[9px] sm:text-[10px] sm:leading-normal ${isFinalized ? "text-slate-400" : "text-slate-500"}`}
                          >
                            Weekend
                          </p>
                        ) : data?.status === "leave" ? (
                          <p
                            className={`mt-1 max-w-full text-[7px] font-medium leading-[9px] sm:text-[10px] sm:leading-normal ${isFinalized ? "text-slate-400" : "text-sky-600"}`}
                          >
                            Leave
                          </p>
                        ) : (
                          <p
                            className={`mt-1 max-w-full text-[7px] font-medium leading-[9px] sm:text-[10px] sm:leading-normal ${isFinalized ? "text-slate-400" : "text-slate-600"}`}
                          >
                            {formatHours(data?.hours || 0)}h
                          </p>
                        )}

                      </div>

                      {/* STATUS */}

                      {data?.status !== "holiday" &&
                        data?.status !== "weekend" && (
                          <span
                            className={`max-w-full text-[7px] font-medium leading-[9px] break-words sm:text-[9px] sm:leading-normal ${isFinalized ? "text-slate-400" : config.cardClass.split(" ").find((x) => x.startsWith("text-")) || "text-slate-500"}`}
                          >
                            {isFinalized ? "Finalized" : config.shortLabel}
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>

              {/* =================================================
                LEGEND
            ================================================= */}

              <div className="mt-4 border-t border-slate-200 pt-3">

                <div className="flex flex-wrap gap-x-5 gap-y-3">

                  <LegendItem
                    label="Approved"
                    color="bg-emerald-500"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Submitted"
                    color="bg-amber-400"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Rejected"
                    color="bg-red-500"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Unlogged"
                    color="bg-slate-400"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Leave"
                    color="bg-sky-500"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Public Holiday"
                    color="bg-violet-500"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Weekend"
                    color="bg-slate-400"
                    finalized={isFinalized}
                  />

                </div>
              </div>

              {/* MONTH TOTAL */}

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    Monthly Hours
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {formatHours(displayTotalHours)}h

                    <span className="ml-1 text-sm font-normal text-slate-400">
                      / {formatHours(targetHours)}h
                    </span>
                  </p>
                </div>

                <div className="w-full max-w-[280px]">

                  <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                    <span>Monthly Progress</span>

                    <span>
                      {progressPercentFromApi ||
                        Math.round(
                          (displayTotalHours / Math.max(targetHours, 1)) * 100
                        )}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className={`h-full rounded-full transition-all ${isFinalized ? "bg-slate-400" : "bg-emerald-500"}`}
                      style={{
                        width: `${Math.min(
                          (displayTotalHours / Math.max(targetHours, 1)) * 100,
                          100
                        )}%`,
                      }}
                    />

                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
              DAY DETAIL
          ================================================= */}

            <div className="h-full min-h-[650px] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">

              {!selectedDay ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    {isFinalized ? (
                      <Lock size={25} />
                    ) : (
                      <CalendarDays size={25} />
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-800">
                    {isFinalized
                      ? "Month Finalized"
                      : "Select a day"}
                  </h3>

                  <p className="mt-2 max-w-[240px] text-sm leading-6 text-slate-500">
                    {isFinalized
                      ? `${monthLabel} is locked. No further changes are allowed.`
                      : "Select any day from the calendar to review or edit its timesheet."}
                  </p>

                </div>
              ) : (
                <div>

                  {/* PANEL HEADER */}

                  <div className="border-b border-slate-200 p-5">

                    <div className="flex items-start justify-between">

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          TIMESHEET DETAIL
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                          {new Date(year, month, selectedDay).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDay(null);
                          setDayDetails(null);
                          setDayDetailsError("");
                          setIsDayDetailsLoading(false);
                          setShowCopyEffortModal(false);
                          setCopyTargetDays([]);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X size={17} />
                      </button>

                    </div>
                  </div>

                  {/* PANEL BODY */}
                  <div className="space-y-4 p-4">
                    {timesheet[selectedDay]?.status === "unlogged" &&
                      isPastDate(timesheet[selectedDay]?.date) ? (
                      <div className="space-y-4">
                        {/* ADMIN SUBMIT HEADER */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                              <Clock3 size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-amber-900">
                                Admin Submit Missing Day
                              </p>
                              <p className="mt-1 text-xs leading-5 text-amber-700">
                                This employee has not logged this day. Add project work and submit the missing timesheet on their behalf.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* PROJECTS */}
                        <div>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <label className="text-xs font-semibold text-slate-700">
                              Projects & Work
                            </label>
                            <span
                              className={`text-xs font-semibold ${getMissingDayTotalHours() > 12 ? "text-red-600" : "text-slate-500"}`}
                            >
                              Total: {formatHours(getMissingDayTotalHours())}h / 12h
                            </span>
                          </div>

                          <div className="space-y-3">
                            {missingDayProjects.map((project, index) => {
                              const calculatedHours = calculateTimeHours(
                                project.start_time,
                                project.end_time
                              );
                              const fieldErrors =
                                missingDayProjectErrors[index] || {};

                              return (
                                <div
                                  key={index}
                                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                                >
                                  <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-semibold text-slate-700">
                                      Project {index + 1}
                                    </p>

                                    {missingDayProjects.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMissingDayProjects((prev) =>
                                            prev.filter((_, i) => i !== index)
                                          );
                                          setMissingDayProjectErrors((prev) =>
                                            prev.filter((_, i) => i !== index)
                                          );
                                        }}
                                        className="text-[11px] font-semibold text-red-500 hover:text-red-700"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                        Project
                                      </label>
                                      <input
                                        type="text"
                                        value={project.project_name}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setMissingDayProjects((prev) =>
                                            prev.map((item, i) =>
                                              i === index
                                                ? { ...item, project_name: value }
                                                : item
                                            )
                                          );
                                        }}
                                        placeholder="Project name"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                        Task
                                      </label>
                                      <input
                                        type="text"
                                        value={project.task_name}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setMissingDayProjects((prev) =>
                                            prev.map((item, i) =>
                                              i === index
                                                ? { ...item, task_name: value }
                                                : item
                                            )
                                          );
                                        }}
                                        placeholder="Task name "
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div>
                                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                        Start Time
                                      </label>
                                      <input
                                        type="time"
                                        value={project.start_time}
                                        onChange={(e) => {
                                          const value = e.target.value;

                                          setMissingDayProjects((prev) =>
                                            prev.map((item, i) =>
                                              i === index
                                                ? { ...item, start_time: value }
                                                : item
                                            )
                                          );

                                          setMissingDayProjectErrors((prev) =>
                                            prev.map((item, i) => {
                                              if (i !== index) return item;

                                              if (value && project.end_time) {
                                                const calculated = calculateTimeHours(
                                                  value,
                                                  project.end_time
                                                );

                                                if (calculated <= 0) {
                                                  return {
                                                    ...item,
                                                    start_time:
                                                      "Start time must be earlier than end time.",
                                                    end_time:
                                                      "End time must be later than start time.",
                                                  };
                                                }

                                                if (calculated > 12) {
                                                  return {
                                                    ...item,
                                                    start_time:
                                                      "Working time cannot exceed 12 hours.",
                                                    end_time:
                                                      "Working time cannot exceed 12 hours.",
                                                  };
                                                }
                                              }

                                              return { ...item, start_time: "", end_time: "" };
                                            })
                                          );
                                          setSaveMessage("");
                                        }}
                                        className={`w-full rounded-lg border px-3 py-2.5 text-xs outline-none transition ${fieldErrors.start_time ? "border-red-400 bg-red-50 text-red-800 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-slate-200 bg-white text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"}`}
                                      />
                                      {fieldErrors.start_time && (
                                        <p className="mt-1 text-[10px] font-medium text-red-600">
                                          {fieldErrors.start_time}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                        End Time
                                      </label>
                                      <input
                                        type="time"
                                        value={project.end_time}
                                        onChange={(e) => {
                                          const value = e.target.value;

                                          setMissingDayProjects((prev) =>
                                            prev.map((item, i) =>
                                              i === index
                                                ? { ...item, end_time: value }
                                                : item
                                            )
                                          );
                                          setMissingDayProjectErrors((prev) =>
                                            prev.map((item, i) => {
                                              if (i !== index) return item;

                                              if (project.start_time && value) {
                                                const calculated = calculateTimeHours(
                                                  project.start_time,
                                                  value
                                                );

                                                if (calculated <= 0) {
                                                  return {
                                                    ...item,
                                                    start_time:
                                                      "Start time must be earlier than end time.",
                                                    end_time:
                                                      "End time must be later than start time.",
                                                  };
                                                }

                                                if (calculated > 12) {
                                                  return {
                                                    ...item,
                                                    start_time:
                                                      "Working time cannot exceed 12 hours.",
                                                    end_time:
                                                      "Working time cannot exceed 12 hours.",
                                                  };
                                                }
                                              }
                                              return { ...item, start_time: "", end_time: "" };
                                            })
                                          );
                                          setSaveMessage("");
                                        }}
                                        className={`w-full rounded-lg border px-3 py-2.5 text-xs outline-none transition ${fieldErrors.end_time ? "border-red-400 bg-red-50 text-red-800 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-slate-200 bg-white text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"}`}
                                      />
                                      {fieldErrors.end_time && (
                                        <p className="mt-1 text-[10px] font-medium text-red-600">
                                          {fieldErrors.end_time}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                        Hours
                                      </label>
                                      <div
                                        className={`flex min-h-[42px] w-full items-center rounded-lg border px-3 py-2.5 text-xs font-semibold ${fieldErrors.hours ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-700"}`}
                                      >
                                        {calculatedHours > 0
                                          ? `${formatHours(calculatedHours)}h`
                                          : ""}
                                      </div>
                                      {fieldErrors.hours && (
                                        <p className="mt-1 text-[10px] font-medium text-red-600">
                                          {fieldErrors.hours}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                      Description
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={project.description}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setMissingDayProjects((prev) =>
                                          prev.map((item, i) =>
                                            i === index
                                              ? { ...item, description: value }
                                              : item
                                          )
                                        );
                                      }}
                                      placeholder="Describe the work completed..."
                                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (missingDayProjects.length >= 10) {
                                setSaveMessage("Maximum 10 projects can be added.");
                                return;
                              }

                              if (getMissingDayTotalHours() >= 12) {
                                setSaveMessage("Maximum 12 hours already reached.");
                                return;
                              }

                              setMissingDayProjects((prev) => [
                                ...prev,
                                createEmptyProject(),
                              ]);
                              setMissingDayProjectErrors((prev) => [
                                ...prev,
                                {},
                              ]);
                              setSaveMessage("");
                            }}
                            className={`mt-3 w-full rounded-lg border border-dashed px-3 py-2.5 text-xs font-semibold transition ${missingDayProjects.length >= 10 ? "cursor-not-allowed border-red-200 bg-red-50 text-red-500" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"}`}
                          >
                            {missingDayProjects.length >= 10
                              ? "Maximum 10 Projects Reached"
                              : "+ Add Project"}
                          </button>
                        </div>
                        {saveMessage && (
                          <div
                            className={`rounded-lg border px-3 py-2.5 text-xs font-medium ${saveMessage.includes("successfully") ||
                              saveMessage === "All pending days have been approved" ||
                              saveMessage === "All submitted days have been approved"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              {saveMessage.includes("successfully") ||
                                saveMessage === "All pending days have been approved" ||
                                saveMessage === "All submitted days have been approved" ? (
                                <CheckCircle2 size={15} />
                              ) : (
                                <AlertCircle size={15} />
                              )}

                              <span>{saveMessage}</span>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={isFinalized || isSubmittingMissingDay}
                          onClick={handleAdminSubmitMissingDay}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          <Save size={16} />
                          {isSubmittingMissingDay ? "Submitting..." : "Save & Submit Missing Day"}
                        </button>
                      </div>
                    ) : timesheet[selectedDay]?.status === "unlogged" ? (
                      <div className="flex flex-1 flex-col p-4">
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
                              <Clock3 size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-amber-900">
                                {isTodayDate(timesheet[selectedDay]?.date)
                                  ? "Today's Timesheet"
                                  : "Future Date Locked"}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-amber-700">
                                {isTodayDate(timesheet[selectedDay]?.date)
                                  ? "The employee can log their working hours until the end of today. Admin editing will be available once the date has passed."
                                  : "Future unlogged dates cannot be edited by Admin. Timesheet details can be added once the date becomes a past working day."}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Timesheet Status
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                Unlogged
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {isTodayDate(timesheet[selectedDay]?.date)
                                ? "Today"
                                : "Future"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-700">
                            What happens next?
                          </p>

                          <div className="mt-4 space-y-4">
                            <div className="flex gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm">
                                1
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-700">
                                  Employee logs the work
                                </p>
                                <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                                  Working hours and project details can be entered for the selected day.
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm">
                                2
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-700">
                                  Day becomes available to Admin
                                </p>
                                <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                                  Admin editing is enabled after the selected date has passed.
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm">
                                3
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-700">
                                  Timesheet can be reviewed
                                </p>
                                <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                                  Once details are available, Admin can review and process the day normally.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-4">
                          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
                            <Lock size={15} className="mt-0.5 shrink-0 text-slate-400" />
                            <p className="text-[11px] leading-5 text-slate-500">
                              {isTodayDate(timesheet[selectedDay]?.date)
                                ? "Admin editing is intentionally disabled while the employee's working day is still in progress."
                                : "Admin editing is intentionally disabled because this is a future working day."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>

                        <div className="space-y-4 p-4">

                          {/* CURRENT STATUS */}

                          <div>
                            <label className="mb-2 block text-xs font-medium text-slate-600">
                              Current Status
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(STATUS_CONFIG)
                                .filter(([status]) => status !== "weekend" && status !== "submitted")
                                .map(([status, config]) => {
                                  const isEditableStatus =
                                    status === "approved" || status === "rejected";

                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      disabled={
                                        isFinalized ||
                                        timesheet[selectedDay]?.status === "holiday" ||
                                        timesheet[selectedDay]?.status === "weekend" ||
                                        !isEditableStatus
                                      }
                                      onClick={() => {
                                        if (isEditableStatus) {
                                          handleStatusChange(status);
                                        }
                                      }}
                                      className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition ${timesheet[selectedDay]?.status === status ? `${config.cardClass} ring-1 ring-current` : "border-slate-200 bg-white text-slate-500"} ${isFinalized || !isEditableStatus ? "cursor-not-allowed opacity-70" : "hover:bg-slate-50"}`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span
                                          className={`h-2 w-2 rounded-full ${config.dotClass}`}
                                        />

                                        {status === "pending" ? "Submitted" : config.label}
                                      </span>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>

                          {saveMessage && (
                            <div
                              className={`rounded-lg border px-3 py-2.5 text-xs font-medium ${/(successfully|approved|updated|submitted|finalized|saved)\b/i.test(saveMessage) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
                            >
                              <div className="flex items-center gap-2">
                                {/(successfully|approved|updated|submitted|finalized|saved)\b/i.test(
                                  saveMessage
                                ) ? (
                                  <CheckCircle2 size={15} />
                                ) : (
                                  <AlertCircle size={15} />
                                )}
                                <span>{saveMessage}</span>
                              </div>
                            </div>
                          )}

                          {/* HOURS */}

                          <div>

                            <label className="mb-2 block text-xs font-medium text-slate-600">
                              Working Hours
                            </label>

                            <div className="relative">

                              <Clock3
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />

                              <input
                                type="number"
                                min="0"
                                max="12"
                                step="0.5"
                                value={editHours}
                                disabled={
                                  isFinalized ||
                                  timesheet[selectedDay]
                                    ?.status === "holiday" ||
                                  timesheet[selectedDay]
                                    ?.status === "weekend" ||
                                  timesheet[selectedDay]
                                    ?.status === "leave"
                                }
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEditHours(value);

                                  // Update the draft immediately so the value is not
                                  // lost when the user moves to another day.
                                  if (selectedDay && value !== "") {
                                    const numericHours = Number(value);

                                    if (!Number.isNaN(numericHours) && numericHours >= 0) {
                                      setTimesheet((prev) => ({
                                        ...prev,
                                        [selectedDay]: {
                                          ...prev[selectedDay],
                                          hours: numericHours,
                                        },
                                      }));
                                    }
                                  }
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                              />

                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                hours
                              </span>

                            </div>
                          </div>

                          {/* =================================================
                            PROJECT DETAILS FROM DAY DETAIL API
                          ================================================= */}
                          {!['unlogged', 'leave', 'holiday'].includes(timesheet[selectedDay]?.status) && (
                            <div>
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <label className="text-xs font-semibold text-slate-700">
                                    Project Details
                                  </label>
                                  {!isEditingProjectDetails && !isDayDetailsLoading && Array.isArray(dayDetails?.projects) && dayDetails.projects.length > 0 && !isFinalized && (
                                    <button
                                      type="button"
                                      onClick={() => setIsEditingProjectDetails(true)}
                                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                                      title="Edit project details"
                                    >
                                      <Pencil size={11} />
                                      Edit
                                    </button>
                                  )}
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  {!isDayDetailsLoading && dayDetails?.total_hours != null && (
                                    <span className="text-xs font-semibold text-slate-500">
                                      Total: {formatHours(dayDetails.total_hours)}h
                                    </span>
                                  )}
                                  {isEditingProjectDetails && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={cancelProjectDetailsEdit}
                                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-50"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={saveProjectDetailsDraft}
                                        className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-slate-800"
                                      >
                                        <Save size={11} />
                                        Save
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {isDayDetailsLoading ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                                  <FiLoader className="mx-auto animate-spin text-lg text-slate-500" />
                                  <p className="mt-2 text-xs text-slate-500">
                                    Loading project details...
                                  </p>
                                </div>
                              ) : dayDetailsError ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                                    <p className="text-xs leading-5 text-red-700">
                                      {dayDetailsError}
                                    </p>
                                  </div>
                                </div>
                              ) : Array.isArray(dayDetails?.projects) && dayDetails.projects.length > 0 ? (
                                <div className="space-y-3">
                                  {(isEditingProjectDetails ? editableDayProjects : dayDetails.projects).map((project, index) => (
                                    <div
                                      key={`${dayDetails.day_entry_id || selectedDay}-${index}`}
                                      className={`rounded-xl border p-3 ${isEditingProjectDetails ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50"}`}
                                    >
                                      <div className="mb-3 flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-slate-800">
                                          Project {index + 1}
                                        </p>
                                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm">
                                          {formatHours(
                                            isEditingProjectDetails
                                              ? calculateTimeHours(project.start_time, project.end_time)
                                              : project.hours || 0
                                          )}h
                                        </span>
                                      </div>

                                      {isEditingProjectDetails ? (
                                        <>
                                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                              <label className="mb-1 block text-[10px] font-medium text-slate-500">Project</label>
                                              <input
                                                type="text"
                                                value={project.project_name || ""}
                                                onChange={(e) => updateEditableProject(index, "project_name", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                              />
                                            </div>
                                            <div>
                                              <label className="mb-1 block text-[10px] font-medium text-slate-500">Task</label>
                                              <input
                                                type="text"
                                                value={project.task_name || ""}
                                                onChange={(e) => updateEditableProject(index, "task_name", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                              />
                                            </div>
                                          </div>

                                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                              <label className="mb-1 block text-[10px] font-medium text-slate-500">Start Time</label>
                                              <input
                                                type="time"
                                                value={project.start_time || ""}
                                                onChange={(e) => updateEditableProject(index, "start_time", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                              />
                                            </div>
                                            <div>
                                              <label className="mb-1 block text-[10px] font-medium text-slate-500">End Time</label>
                                              <input
                                                type="time"
                                                value={project.end_time || ""}
                                                onChange={(e) => updateEditableProject(index, "end_time", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                              />
                                            </div>
                                          </div>

                                          <div className="mt-3">
                                            <label className="mb-1 block text-[10px] font-medium text-slate-500">Description</label>
                                            <textarea
                                              rows={2}
                                              value={project.description || ""}
                                              onChange={(e) => updateEditableProject(index, "description", e.target.value)}
                                              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                          <div>
                                            <p className="text-[10px] font-medium text-slate-400">Project</p>
                                            <p className="mt-1 break-words text-xs font-semibold text-slate-700">
                                              {project.project_name || "—"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-medium text-slate-400">Task</p>
                                            <p className="mt-1 break-words text-xs font-semibold text-slate-700">
                                              {project.task_name || "—"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-medium text-slate-400">Start Time</p>
                                            <p className="mt-1 text-xs font-semibold text-slate-700">
                                              {project.start_time || "—"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-medium text-slate-400">End Time</p>
                                            <p className="mt-1 text-xs font-semibold text-slate-700">
                                              {project.end_time || "—"}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {!isEditingProjectDetails && project.description && (
                                        <div className="mt-3 border-t border-slate-200 pt-3">
                                          <p className="text-[10px] font-medium text-slate-400">Description</p>
                                          <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                                            {project.description}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                                  <p className="text-xs text-slate-500">
                                    No project details available for this day.
                                  </p>
                                </div>
                              )}

                              {dayDetails?.rejection_note && (
                                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                                    <div>
                                      <p className="text-xs font-semibold text-red-800">
                                        Rejection Note
                                      </p>
                                      <p className="mt-1 text-xs leading-5 text-red-700">
                                        {dayDetails.rejection_note}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* HOLIDAY */}

                          {timesheet[selectedDay]?.status ===
                            "holiday" && (
                              <div className="flex gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">

                                <CalendarDays
                                  size={18}
                                  className="mt-0.5 shrink-0 text-violet-600"
                                />

                                <div>
                                  <p className="text-sm font-medium text-violet-800">
                                    Public Holiday
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-violet-600">
                                    {timesheet[selectedDay]?.holidayName ||
                                      "Public Holiday"}
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-violet-500">
                                    Holiday dates cannot be edited.
                                  </p>
                                </div>

                              </div>
                            )}

                          {/* WEEKEND DETAIL — shown only when a weekend day is selected */}

                          {timesheet[selectedDay]?.status ===
                            "weekend" && (
                              <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-100 p-4">
                                <CalendarDays
                                  size={18}
                                  className="mt-0.5 shrink-0 text-slate-500"
                                />

                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    Weekend
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {timesheet[selectedDay]?.weekendName ||
                                      "Saturday / Sunday"}{" "}
                                    is a weekly weekend. Weekend days cannot be edited.
                                  </p>
                                </div>
                              </div>
                            )}

                          {/* REJECTED */}

                          {timesheet[selectedDay]?.status ===
                            "rejected" && (
                              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                                <AlertCircle
                                  size={18}
                                  className="mt-0.5 shrink-0 text-red-600"
                                />

                                <div>
                                  <p className="text-sm font-medium text-red-800">
                                    Timesheet Rejected
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-red-600">
                                    Review the hours and update the
                                    status when required.
                                  </p>
                                </div>

                              </div>
                            )}

                          {/* FINALIZED */}

                          {isFinalized && (
                            <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                              <Lock
                                size={18}
                                className="mt-0.5 shrink-0 text-slate-500"
                              />

                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  Month Finalized
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  This timesheet can no longer be
                                  modified.
                                </p>
                              </div>

                            </div>
                          )}

                          {/* SAVE DAY */}

                          <button
                            type="button"
                            disabled={
                              isFinalized ||
                              isEditingDay ||
                              timesheet[selectedDay]
                                ?.status === "holiday" ||
                              timesheet[selectedDay]
                                ?.status === "weekend" ||
                              (timesheet[selectedDay]?.status === "unlogged" &&
                                !isPastDate(timesheet[selectedDay]?.date))
                            }
                            onClick={handleSaveDay}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            <Save size={16} />
                            {isEditingDay ? "Updating..." : "Save Day Changes"}
                          </button>


                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
            BOTTOM ACTION BAR
        ===================================================== */}

          <div className="mt-4">

            <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                {/* INFO */}

                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${isFinalized ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"}`}
                  >
                    {isFinalized ? (
                      <Lock size={18} />
                    ) : (
                      <UserRound size={18} />
                    )}
                  </div>

                  <div>

                    <p className="text-sm font-medium text-slate-800">
                      {isFinalized
                        ? "Timesheet finalized"
                        : `${monthLabel} timesheet`}
                    </p>

                    <p className="text-xs text-slate-500">
                      {isFinalized
                        ? "No further changes are allowed."
                        : `${statusCounts.pending} day${statusCounts.pending !== 1
                          ? "s"
                          : ""
                        } waiting for approval.`}
                    </p>

                    {!isFinalized && unsavedDays.length > 0 && (
                      <p className="mt-0.5 text-[11px] font-medium text-amber-600">
                        {unsavedDays.length} unsaved day{unsavedDays.length !== 1 ? "s" : ""}
                      </p>
                    )}

                  </div>
                </div>

                {/* ACTION BUTTONS */}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">

                  {/* EXPORT CSV */}

                  <TimesheetExport
                    timesheet={timesheet}
                    employee={employee}
                    activeEmployeeCode={activeEmployeeCode}
                    year={year}
                    month={month}
                    monthValue={monthValue}
                    monthLabel={monthLabel}
                    isFinalized={isFinalized}
                  />

                  {/* SAVE */}

                  <button
                    type="button"
                    disabled={isFinalized || isSaving || isEditingDay || unsavedDays.length === 0}
                    onClick={handleSaveChanges}
                    className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>

                  {/* BULK APPROVE */}

                  <button
                    type="button"
                    disabled={
                      isFinalized || isSaving || (statusCounts.pending + statusCounts.submitted) === 0
                    }
                    onClick={handleBulkApprove}
                    className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <CheckCheck size={16} />
                    {isSaving ? "Processing..." : "Bulk Approve"}
                  </button>

                  {/* FINALIZE */}

                  <button
                    type="button"
                    disabled={isFinalized || isFinalizing || isSaving}
                    onClick={handleOpenFinalizeModal}
                    className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <Lock size={16} />
                    {isFinalizing ? "Finalizing..." : "Finalize"}
                  </button>

                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
            COPY THIS EFFORT MODAL
        ===================================================== */}

          {showCopyEffortModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Copy size={17} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Copy This Effort
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Copy the approved day's project and time details to selected unlogged days.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isCopyingEffort) return;
                        setShowCopyEffortModal(false);
                        setCopyTargetDays([]);
                      }}
                      disabled={isCopyingEffort}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Close copy effort modal"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                          Source Day
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-900">
                          {selectedDay
                            ? new Date(year, month, selectedDay).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-medium text-emerald-700">Approved</p>
                        <p className="mt-1 text-sm font-bold text-emerald-900">
                          {formatHours(
                            copyEffortSourceProjects.reduce(
                              (total, project) =>
                                total +
                                (Number(project.hours) ||
                                  calculateTimeHours(project.start_time, project.end_time)),
                              0
                            )
                          )}h
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Select Unlogged Days
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          Only unlogged days from {monthLabel} can be selected.
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                        {copyTargetDays.length} selected
                      </span>
                    </div>
                    {copyEffortTargetDays.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                        <p className="text-xs font-medium text-slate-600">
                          No unlogged days available
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          All days in this month already have a timesheet status.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {copyEffortTargetDays.map(({ day, data }) => {
                          const checked = copyTargetDays.includes(day);

                          return (
                            <label
                              key={`copy-target-${day}`}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 transition ${checked
                                ? "border-emerald-300 bg-emerald-50"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={isCopyingEffort}
                                  onChange={() => {
                                    setCopyTargetDays((prev) =>
                                      prev.includes(day)
                                        ? prev.filter((item) => item !== day)
                                        : [...prev, day].sort((a, b) => a - b)
                                    );
                                    setSaveMessage("");
                                  }}
                                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="min-w-0">
                                  <span className="block text-xs font-semibold text-slate-800">
                                    {new Date(year, month, day).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                                    Unlogged • {data?.hours ? `${formatHours(data.hours)}h` : "0h"}
                                  </span>
                                </span>
                              </span>

                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500">
                                Unlogged
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {saveMessage && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} />
                        <span>{saveMessage}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCopyingEffort) return;
                        setShowCopyEffortModal(false);
                        setCopyTargetDays([]);
                        setSaveMessage("");
                      }}
                      disabled={isCopyingEffort}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyEffort}
                      disabled={
                        isCopyingEffort ||
                        copyTargetDays.length === 0 ||
                        copyEffortSourceProjects.length === 0
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      <Copy size={16} />
                      {isCopyingEffort ? "Copying & Submitting..." : "Copy & Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
            SUCCESS / ERROR POPUP
          ===================================================== */}

          {popup.show && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {popup.type === "finalize-error" ? (
                  <>
                    <div className="border-b border-slate-100 px-5 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <XCircle size={22} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900">
                            Cannot Finalize Timesheet
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Please resolve the following days before finalizing this timesheet.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[330px] space-y-3 overflow-y-auto px-5 py-4">
                      {Object.entries(popup.details || {}).map(([status, dates]) => {
                        const labelMap = {
                          unlogged: "Unlogged Days",
                          rejected: "Rejected Days",
                          submitted: "Submitted Days",
                        };
                        const label =
                          labelMap[status] ||
                          `${status.charAt(0).toUpperCase()}${status.slice(1)} Days`;

                        return (
                          <div
                            key={status}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                <p className="text-xs font-semibold text-slate-800">
                                  {label}
                                </p>
                              </div>
                              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm">
                                {dates.length}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {dates.map((date, index) => {
                                const formattedDate = date
                                  ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                  : "Unknown date";

                                return (
                                  <span
                                    key={`${status}-${date}-${index}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600"
                                  >
                                    <CalendarDays size={12} className="text-slate-400" />
                                    {formattedDate}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 bg-white px-5 py-4">
                      <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2.5 text-[11px] font-medium leading-5 text-amber-800">
                        Approved, holiday, leave, unpaid leave and weekend days do not block finalization.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPopup({ show: false });
                          setSaveMessage("");
                          setApiError("");
                        }}
                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <p className={`mb-4 font-semibold ${popup.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {popup.message}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPopup({ show: false });
                        setSaveMessage("");
                        setApiError("");
                      }}
                      className="rounded px-4 py-2 bg-green-800 text-white cursor-pointer hover:bg-green-700"
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
            FINALIZE MODAL
        ===================================================== */}

          {showFinalizeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Lock size={20} />
                  </div>

                  <div>

                    <h3 className="text-lg font-semibold text-slate-900">
                      Finalize {monthLabel}?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Once finalized, this employee's
                      {monthLabel} timesheet cannot be edited or
                      changed anymore.
                    </p>

                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

                  <p className="text-xs font-medium leading-5 text-amber-800">
                    Please verify all hours, approvals,
                    rejected days, leave requests, holidays and
                    weekends before finalizing.
                  </p>

                </div>

                <div className="mt-6 flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setShowFinalizeModal(false)
                    }
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalize}
                    disabled={isFinalizing}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    {isFinalizing ? "Finalizing..." : "Finalize Month"}
                  </button>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  config,
  finalized,
}) {
  return (
    <div
      className={`min-w-[105px] rounded-xl border px-3 py-2.5 ${finalized ? "border-slate-200 bg-slate-100 text-slate-400" : config.cardClass}`}
    >
      <div className="flex items-center gap-1.5">

        <span
          className={`h-2 w-2 rounded-full ${finalized ? "bg-slate-400" : config.dotClass}`}
        />

        <p className="text-[10px] font-medium">
          {title}
        </p>
      </div>
      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */
function LegendItem({
  label,
  color,
  finalized,
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-2.5 w-2.5 rounded-full ${finalized ? "bg-slate-300" : color}`}
      />

      <span
        className={`text-xs ${finalized ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </span>
    </div>
  );
}
