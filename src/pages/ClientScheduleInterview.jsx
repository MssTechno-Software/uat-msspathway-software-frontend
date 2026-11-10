import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ScheduleInterviewModal from "../container/ScheduleInterviewModal";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "../api/axios";
import {
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiExternalLink,
  FiList,
  FiLoader,
  FiAlertCircle,
  FiPlus,
  FiSearch,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import { getAccessToken } from "../services/authSession";

// Keep the backend interview type and its display label consistent.
const IN_PERSON_INTERVIEW_TYPE = "in_person";
const T = {
  primary: "bg-green-800 hover:bg-green-900 text-white",
  focus: "focus:border-green-700 focus:ring-2 focus:ring-green-100",
  brownSoft: "bg-[#f1e6da] text-[#5a361e]",
  border: "border-[#e7dccf]",
};
const TYPE_TITLE = {
  company: "Company based",
  resume: "Resume based",
  realtime: "Real-time interview",
  in_person: "In person",
};
// Apply row styling based on the interview source.
const getInterviewStyle = (item) => {
  if (item.interview_source === "realtime") {
    return {
      row: "bg-blue-50 hover:bg-blue-100",
      border: "border-l-[6px] border-blue-600",
      title: "text-blue-800",
    };
  }
  return {
    row: "bg-slate-100 hover:bg-slate-200",
    border: "border-l-[6px] border-slate-600",
    title: "text-slate-700",
  };
};
// Attach the stored authentication token to API requests.
const authHeaders = () => {
  try {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};
// Map each API record to its interview format.
const formatOf = (item) => {
  if (item.interview_source === "realtime") return "realtime";
  if (item.interview_type === "resume_based") return "resume";
  if (item.interview_type === "company_based") return "company";
  return "in_person";
};
// Use the saved title, or fall back to the interview format.
const displayTitle = (item) =>
  (typeof item.title === "string" && item.title.trim()) || TYPE_TITLE[formatOf(item)] || "Interview";
// Convert underscores to spaces and capitalize the first letter.
const cap = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
// Generate initials from the first two words of a name.
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";
// Format a date-time value for display, with a fallback for invalid dates.
function fmtDateTime(value) {
  if (!value) return { date: "—", time: "" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: String(value), time: "" };
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}
// Prepare the interview details for display based on its format.
function summarize(item) {
  const format = formatOf(item);
  const isRealtime = format === "realtime";
  // Real-time interviews use the scheduled date; other formats use the deadline.
  const when = isRealtime
    ? fmtDateTime(item.scheduled_at)
    : { date: item.deadline_date || "—", time: "" };
  return {
    format,
    title: [item.company_name, item.role].filter(Boolean).join(" · ") || displayTitle(item) || "—",
    sub: isRealtime
      ? item.title
      : [item.mode && cap(item.mode), item.difficulty_level && cap(item.difficulty_level)]
        .filter(Boolean)
        .join(" · "),
    date: when.date,
    time: when.time,
    prefix: isRealtime ? "" : "Due ",
  };
}
// Check whether the interview has reached a closed status.
const isClosed = (status = "") =>
  ["completed", "cancelled", "skipped"].includes(status.toLowerCase());
// Accept web links only, and reject unsafe URL schemes.
const toSafeUrl = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw || /\s/.test(raw)) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) && !/^https?:\/\//i.test(raw)) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname ? candidate : null;
  } catch {
    return null;
  }
};
// Require an explicit http(s) scheme in the form.
// Builds the body shared by company-based and resume-based interviews.
const assignPayload = (interviewType, form) => ({
  interview_type: interviewType,
  company_name: form.company.trim(),
  role: form.role.trim(),
  experience: form.experience,
  mode: form.mode,
  duration_mins: Number(form.duration),
  ...(interviewType === "resume_based" && {
    difficulty_level: form.difficulty,
  }),
  deadline_date: form.deadline,
  assigned_by: form.assignedBy.trim(),
});

/// Manage dialog focus, Escape handling, and keyboard navigation.
function useDialog(onClose, canClose = true) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus();
    // Return focus to the previously active element when the dialog closes.
    return () => previous?.focus?.();
  }, []);
  const onKeyDown = (event) => {
    // Allow Escape to close the dialog only when closing is permitted.
    if (event.key === "Escape" && canClose) {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !ref.current) return;
    const focusable = ref.current.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    // Keep keyboard focus inside the dialog when navigating with Tab.
    if (event.shiftKey && (active === first || active === ref.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return { ref, onKeyDown };
}
// Display the interview status with its corresponding color.
const StatusBadge = ({ status }) => {
  const getColor = () => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "scheduled":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
      case "in progress":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "skipped":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getColor()}`}>
      {String(status ?? "").replace(/_/g, " ")}
    </span>
  );
};
// Generate a compact pagination list around the current page.
const getPageItems = (page, totalPages) => {
  // Show every page when the total count is small.
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  // Calculate the page range around the current page.
  let start = Math.max(2, page - 1);
  let end = Math.min(totalPages - 1, page + 1);
  // Keep the first three pages visible when near the beginning.
  if (page <= 2) end = 3;
  if (start <= 3) start = 2;
  // Keep the last page visible when near the end.
  if (end >= totalPages - 2) end = totalPages - 1;
  const items = [1];
  // Show dots when intermediate pages are hidden.
  if (start > 2) items.push("...");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("...");
  items.push(totalPages);
  return items;
};
const Pagination = ({ page = 1, totalPages = 1, pageSize = 25, onPageChange, onPageSizeChange }) => {
  const current = Math.min(Math.max(1, page), totalPages);
  return (
    <div className="flex items-center justify-between w-full">
      <select
        value={pageSize}
        aria-label="Rows per page"
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="border border-gray-300 text-[11px] px-2 py-1 rounded bg-white"
      >
        <option value={10}>10 Rows</option>
        <option value={25}>25 Rows</option>
        <option value={50}>50 Rows</option>
      </select>
      <div className="flex items-center gap-2">
        <button
          disabled={current <= 1}
          aria-label="Previous page"
          onClick={() => onPageChange(current - 1)}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        {getPageItems(current, totalPages).map((item, index) =>
          item === "..." ? (
            <span key={`gap-${index}`} className="text-gray-500 text-sm">
              ...
            </span>
          ) : (
            <button
              key={`page-${item}`}
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
              aria-current={current === item ? "page" : undefined}
              className={`w-7 h-7 rounded text-xs font-medium
              ${current === item ? "bg-[#2d5a27] text-white" : "text-gray-700 hover:bg-gray-100"}`}
            >
              {item}
            </button>
          )
        )}
        <button
          disabled={current >= totalPages}
          aria-label="Next page"
          onClick={() => onPageChange(current + 1)}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
const Avatar = ({ name, size = "h-9 w-9" }) => (
  <span className={`flex ${size} shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${T.brownSoft}`}>
    {initials(name)}
  </span>
);
function DetailRow({ label, children }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className="flex items-start justify-between gap-6 py-2.5">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="max-w-[65%] break-words text-right text-sm font-medium text-gray-900">{children}</dd>
    </div>
  );
}
function DetailsModal({ item, onClose }) {
  const { ref: dialogRef, onKeyDown } = useDialog(onClose);
  const summary = summarize(item);
  const scheduled = fmtDateTime(item.scheduled_at);
  const created = fmtDateTime(item.created_at);
  const updated = fmtDateTime(item.updated_at);
  // Make saved meeting links clickable only when they are safe URLs.
  const rawLink = typeof item.meeting_link === "string" ? item.meeting_link.trim() : "";
  const meetingUrl = toSafeUrl(rawLink);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={item.company_name || item.title} size="h-11 w-11" />
            <div>
              <h2 id="details-modal-title" className="text-base font-semibold text-gray-900">
                {summary.title}
              </h2>
              <p className="text-sm text-gray-500">
                {TYPE_TITLE[summary.format]} · #{item.interview_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-3">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-500">Status</span>
            <StatusBadge status={item.status} />
          </div>
          <dl className="divide-y divide-gray-100">
            <DetailRow label="Title">{displayTitle(item)}</DetailRow>
            <DetailRow label="Company">{item.company_name}</DetailRow>
            <DetailRow label="Role">{item.role}</DetailRow>
            <DetailRow label="Experience">{item.experience}</DetailRow>
            <DetailRow label="Mode">{item.mode && cap(item.mode)}</DetailRow>
            <DetailRow label="Difficulty">{item.difficulty_level && cap(item.difficulty_level)}</DetailRow>
            <DetailRow label="Duration">{item.duration_minutes ? `${item.duration_minutes} min` : ""}</DetailRow>
            <DetailRow label="Scheduled at">
              {item.scheduled_at ? `${scheduled.date}${scheduled.time ? ` · ${scheduled.time}` : ""}` : ""}
            </DetailRow>
            <DetailRow label="Deadline">{item.deadline_date}</DetailRow>
            <DetailRow label="Assigned by">{item.assigned_by}</DetailRow>
            <DetailRow label="Meeting link">
              {rawLink &&
                (meetingUrl ? (
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-green-800 underline"
                  >
                    Open link <FiExternalLink size={13} />
                  </a>
                ) : (
                  <span className="break-all text-gray-500" title="This is not a valid web link">
                    {rawLink}
                  </span>
                ))}
            </DetailRow>
            <DetailRow label="Created">{item.created_at ? `${created.date} · ${created.time}` : ""}</DetailRow>
            <DetailRow label="Updated">{item.updated_at ? `${updated.date} · ${updated.time}` : ""}</DetailRow>
          </dl>
        </div>
        <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
function SuccessModal({ notice, onClose }) {
  const isError = notice.type === "error";
  const { ref: dialogRef, onKeyDown } = useDialog(onClose);
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        onKeyDown={onKeyDown}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="notice-modal-title"
        aria-describedby="notice-modal-message"
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl outline-none"
      >
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${isError ? "bg-rose-50 text-rose-600" : "bg-green-50 text-green-700"
            }`}
        >
          {isError ? <FiAlertCircle size={28} /> : <FiCheckCircle size={28} />}
        </span>
        <h3 id="notice-modal-title" className={`mt-4 text-lg font-semibold ${isError ? "text-rose-700" : "text-gray-900"}`}>
          {notice.title}
        </h3>
        <p
          id="notice-modal-message"
          className="mt-1.5 max-h-40 overflow-y-auto break-words whitespace-pre-line text-sm leading-6 text-gray-500"
        >
          {notice.message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`mt-6 h-10 w-full rounded-lg text-sm font-semibold ${isError
            ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            : "bg-green-800 text-white hover:bg-green-900"
            }`}
        >
          {isError ? "Close" : "Done"}
        </button>
      </div>
    </div>
  );
}
function ClientScheduleInterview() {
  const { client_id } = useParams();
  const [clientName, setClientName] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total_records: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);
  // Track the current request so older responses cannot replace newer data.
  const requestRef = useRef(null);

  const loadInterviews = useCallback(
    async (pageNo) => {
      // Cancel older requests before loading the selected page.
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      let redirected = false;
      setLoading(true);
      setLoadError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/clients/${client_id}/scheduled-interviews`, {
          params: { view: "list", page: pageNo, page_size: pageSize },
          headers: authHeaders(),
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const body = response.data && typeof response.data === "object" ? response.data : {};
        const hasPagination = body.pagination && typeof body.pagination === "object";
        const pageInfo = hasPagination ? body.pagination : { page: pageNo, total_pages: 1, total_records: 0 };
        const lastPage = Math.max(1, Number(pageInfo.total_pages) || 1);
        // Move to the last available page if the current page no longer exists.
        if (hasPagination && pageNo > lastPage) {
          redirected = true;
          setPage(lastPage);
          return;
        }
        setClientName(body.client_name || "");
        setInterviews(
          Array.isArray(body.scheduled_interviews)
            ? body.scheduled_interviews.filter((row) => row && typeof row === "object")
            : []
        );
        setSummary(body.summary && typeof body.summary === "object" ? body.summary : {});
        setPagination({ ...pageInfo, total_pages: lastPage });
      } catch (error) {
        // Ignore requests that were intentionally cancelled.
        if (axios.isCancel(error) || controller.signal.aborted) return;

        if (error?.response?.status === 401) {
          window.dispatchEvent(new Event("session-expired"));
          return;
        }

        setLoadError(
          getApiErrorMessage(error, "Unable to load interviews.")
        );
      } finally {
        // Let only the newest request control the page and API loaders.
        if (requestRef.current === controller && !redirected) {
          setLoading(false);
          setPageLoading(false);
        }
      }
    },
    [client_id, pageSize]
  );
  useEffect(() => {
    loadInterviews(page);
  }, [loadInterviews, page]);
  // Clean up an active request when the page unmounts.
  useEffect(
    () => () => {
      requestRef.current?.abort();
      requestRef.current = null;
    },
    []
  );
  const refresh = () => (page === 1 ? loadInterviews(1) : setPage(1));
  const handleCreate = async (type, form, setSubmitProgress = () => { }) => {
    try {
      let endpoint = "";
      let payload = {};
      // Build the endpoint and payload for the selected format.
      if (type === "resume") {
        endpoint = `${API_BASE_URL}/api/clients/${client_id}/assign-interview`;
        payload = assignPayload("resume_based", form);
      }
      if (type === "company") {
        endpoint = `${API_BASE_URL}/api/clients/${client_id}/assign-interview`;
        payload = assignPayload("company_based", form);
      }
      if (type === "in_person") {
        endpoint = `${API_BASE_URL}/api/clients/${client_id}/assign-interview`;
        payload = {
          interview_type: IN_PERSON_INTERVIEW_TYPE,
          mode: form.mode,
          duration_mins: Number(form.duration),
          deadline_date: form.deadline,
          assigned_by: form.assignedBy.trim(),
          meeting_link: form.link.trim(),
        };
      }
      if (type === "realtime") {
        endpoint = `${API_BASE_URL}/clients/${client_id}/realtime-interviews`;
        // Convert the selected local date and time to the UTC value expected by the API.
        payload = {
          company_name: form.company.trim(),
          assigned_by: form.assignedBy.trim(),
          stage: form.stage,
          scheduled_date: new Date(`${form.date}T${form.time}:00`).toISOString(),
          scheduled_time: form.time,
          link: form.link.trim(),
          duration_minutes: Number(form.duration),
          deadline_date: new Date(`${form.deadline}T00:00:00`).toISOString(),
          status: form.status,
        };
      }
      const headers = authHeaders();
      if (type === "resume") {
        setSubmitProgress("Uploading resume...");
        const resumeData = new FormData();
        resumeData.append("file", form.resumeFile);
        await axios.post(`${API_BASE_URL}/api/clients/${client_id}/upload-resume`, resumeData, { headers });
        setSubmitProgress("Resume uploaded. Creating interview...");
      } else {
        setSubmitProgress("Creating interview...");
      }
      await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/json", ...headers },
      });
      setShowForm(false);
      setNotice({
        type: "success",
        title: "Interview created",
        message:
          type === "resume"
            ? "Resume uploaded and resume-based interview created successfully."
            : "Interview saved successfully to the server.",
      });
      refresh();
    } catch (error) {
      if (error?.response?.status === 401) {
        window.dispatchEvent(new Event("session-expired"));
        return;
      }

      setNotice({
        type: "error",
        title: "Interview creation failed",
        message: getApiErrorMessage(
          error,
          "Unable to create the interview. Check the API endpoint, authentication, and request body."
        ),
      });
    }
  };
  const stats = {
    total: summary.total_scheduled ?? pagination.total_records ?? 0,
    upcoming: summary.upcoming ?? 0,
    completed: summary.completed ?? 0,
    cancelled: summary.cancelled ?? 0,
  };
  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return interviews
      .filter((item) => {
        const status = String(item.status || "").toLowerCase();
        if (tab === "all") return true;
        if (tab === "upcoming") return !isClosed(status);
        return status === tab;
      })
      .filter((item) =>
        `${item.company_name || ""} ${item.role || ""} ${item.assigned_by || ""} ${item.title || ""}`
          .toLowerCase()
          .includes(query)
      );
  }, [interviews, tab, search]);
  const tabs = [
    { id: "all", label: "All", count: stats.total },
    { id: "upcoming", label: "Upcoming", count: stats.upcoming },
    { id: "completed", label: "Completed", count: stats.completed },
    { id: "cancelled", label: "Cancelled", count: stats.cancelled },
  ];
  const totalPages = pagination.total_pages || 1;
  const rowKey = (item) => `${item.interview_source}-${item.interview_id}`;
  // Keep the requested loader above the entire workspace while data is loading.
  return (
    <>
      {(loading || pageLoading) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-3 p-6">
            <FiLoader className="animate-spin text-4xl text-green-800" />
            <p className="font-medium text-gray-800">Please wait...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen w-full bg-[#F9FAFB] text-gray-900">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold mb-1">Scheduled Interviews</h1>
                <p className="text-sm text-gray-500">
                  Assign and track interviews for{" "}
                  <span className="font-medium text-gray-700">{clientName || "this client"}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search company, role, assigned by"
                  aria-label="Search interviews"
                  className={`h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-9 text-sm outline-none ${T.focus}`}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowForm(true)}
                className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm ${T.primary}`}
              >
                <FiPlus size={17} /> Schedule interview
              </button>
            </div>
          </div>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total interviews", value: stats.total, icon: FiList, tone: "text-[#5a361e] border-[#e7dccf]" },
              { label: "Upcoming", value: stats.upcoming, icon: FiClock, tone: "text-amber-600 border-amber-200" },
              { label: "Completed", value: stats.completed, icon: FiCheckCircle, tone: "text-green-700 border-green-200" },
              { label: "Cancelled", value: stats.cancelled, icon: FiXCircle, tone: "text-rose-600 border-rose-200" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-xl border bg-white px-5 py-4 ${T.border}`}
                >
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.value}</p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white ${item.tone}`}>
                    <Icon size={18} />
                  </span>
                </div>
              );
            })}
          </div>
          <div className={`overflow-hidden rounded-2xl border bg-white ${T.border}`}>
            <div className={`border-b px-4 pt-3 sm:px-6 ${T.border}`}>
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${tab === item.id
                      ? "border-green-800 text-green-800"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                      }`}
                  >
                    {item.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${tab === item.id ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {loadError ? (
              <div className="px-6 py-16 text-center" role="alert">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <FiAlertCircle size={24} />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">Couldn't load interviews</h3>
                <p className="mx-auto mt-1 max-w-md break-words whitespace-pre-line text-sm text-gray-500">
                  {loadError}
                </p>
                <button
                  onClick={() => loadInterviews(page)}
                  className={`mt-4 inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold ${T.primary}`}
                >
                  Try again
                </button>
              </div>
            ) : visible.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${T.brownSoft}`}>
                  <FiCalendar size={22} />
                </span>
                <h3 className="mt-4 text-sm font-semibold">
                  {interviews.length === 0 ? "No interviews yet" : "No matching interviews"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {interviews.length === 0
                    ? "Schedule the first interview for this client."
                    : "Try changing the tab or search."}
                </p>
                {interviews.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${T.primary}`}
                  >
                    <FiPlus size={15} /> Schedule interview
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full font-[Inter,ui-sans-serif,system-ui,sans-serif]">
                    <thead className="bg-gray-50">
                      <tr className="text-[12px] font-semibold uppercase tracking-widest text-[#514441]">
                        <th scope="col" className="px-6 py-4 text-left">Interview Type</th>
                        <th scope="col" className="px-6 py-4 text-left">Duration</th>
                        <th scope="col" className="px-6 py-4 text-left">Deadline Date</th>
                        <th scope="col" className="px-6 py-4 text-left">Assigned By</th>
                        <th scope="col" className="px-6 py-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((item) => {
                        const style = getInterviewStyle(item);
                        return (
                          <tr
                            key={rowKey(item)}
                            onClick={() => setSelected(item)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelected(item);
                              }
                            }}
                            tabIndex={0}
                            className={`${style.row} cursor-pointer border-t border-gray-200 transition-all hover:brightness-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600`}
                          >
                            <td className={`px-6 py-6 ${style.border}`}>
                              <h3 className={`text-[13px] font-bold uppercase tracking-wide ${style.title}`}>
                                {displayTitle(item)}
                              </h3>
                              <p className="mt-1 text-[15px] text-slate-700">
                                {item.company_name || item.mode || item.interview_source}
                              </p>
                            </td>
                            <td className="px-6 py-6 text-[14px] text-[#0b1c30]">
                              {item.duration_minutes ? `${item.duration_minutes} mins` : "—"}
                            </td>
                            <td className="px-6 py-6">{item.deadline_date || "—"}</td>
                            <td className="px-6 py-6 text-[14px] text-[#0b1c30]">{item.assigned_by || "—"}</td>
                            <td className="px-6 py-6">
                              <StatusBadge status={item.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 p-4 md:hidden">
                  {visible.map((item) => {
                    const heading = displayTitle(item) || TYPE_TITLE[formatOf(item)];
                    const sub =
                      [item.company_name, item.role].filter(Boolean).join(" · ") ||
                      (item.mode ? cap(item.mode) : "—");
                    const style = getInterviewStyle(item);
                    return (
                      <button
                        key={rowKey(item)}
                        onClick={() => setSelected(item)}
                        className={`rounded-lg border border-gray-200 p-4 text-left ${style.row} ${style.border}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`truncate text-[13px] font-bold uppercase tracking-wide ${style.title}`}>
                              {heading}
                            </p>
                            <p className="mt-1 truncate text-sm text-gray-600">{sub}</p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                          {item.duration_minutes ? `${item.duration_minutes} mins` : "—"} · Deadline{" "}
                          {item.deadline_date || "—"} · By {item.assigned_by || "—"}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-gray-200 bg-white px-6 py-4">
                  <Pagination
                    page={pagination.page || page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(n) => {
                      setPageSize(n);
                      setPage(1);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        {showForm && <ScheduleInterviewModal onClose={() => setShowForm(false)} onCreate={handleCreate} />}
        {notice && <SuccessModal notice={notice} onClose={() => setNotice(null)} />}
        {selected && <DetailsModal item={selected} onClose={() => setSelected(null)} />}
      </div>
    </>
  );
}
export default ClientScheduleInterview;
