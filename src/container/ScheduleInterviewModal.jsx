import { useEffect, useRef, useState } from "react";
import {
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiLoader,
  FiUserCheck,
  FiVideo,
  FiX,
  FiUploadCloud,
} from "react-icons/fi";
import { API_BASE_URL } from "../api/axios";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "./ApiErrorModal";
// Shared Tailwind classes keep form styling consistent.
const T = {
  primary: "bg-green-800 hover:bg-green-900 text-white",
  focus: "focus:border-green-700 focus:ring-2 focus:ring-green-100",
  brownSoft: "bg-[#f1e6da] text-[#5a361e]",
  border: "border-[#e7dccf]",
};
// Dropdown options used by the interview form.
const EXPERIENCE = ["Fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years"].map((v) => ({ v, l: v }));
const MODES = [
  { v: "technical", l: "Technical" },
  { v: "hr", l: "HR" },
  { v: "behavioral", l: "Behavioral" },
  { v: "coding", l: "Coding" },
];
const LEVELS = [
  { v: "easy", l: "Easy" },
  { v: "medium", l: "Medium" },
  { v: "hard", l: "Hard" },
];
const DURATIONS = [15, 30, 45, 60].map((d) => ({ v: String(d), l: `${d} minutes` }));
const STAGES = ["HR round", "Technical round", "Coding round", "Managerial round", "Final round"].map((v) => ({ v, l: v }));
const STATUSES = ["Scheduled", "Pending", "Completed", "Cancelled"].map((v) => ({ v, l: v }));
// Interview formats available in the scheduling modal.
const TYPES = [
  { id: "company", title: "Company based", icon: FiBriefcase, desc: "Prepare for a target company and role, due by a deadline." },
  { id: "resume", title: "Resume based", icon: FiFileText, desc: "Questions based on the resume, due by a deadline." },
  { id: "realtime", title: "Real-time interview", icon: FiVideo, desc: "Live session with a meeting link." },
  { id: "in_person", title: "In person", icon: FiUserCheck, desc: "In-person round with a meeting link." },
];
// Field definitions are shared by rendering and validation.
const F_COMPANY = { key: "company", label: "Company name", type: "text", ph: "e.g. Microsoft" };
const F_ROLE = { key: "role", label: "Role", type: "text", ph: "e.g. Backend Developer" };
const F_EXP = { key: "experience", label: "Experience", type: "select", options: EXPERIENCE };
const F_MODE = { key: "mode", label: "Mode", type: "select", options: MODES };
const F_DURATION = { key: "duration", label: "Duration", type: "select", options: DURATIONS };
const F_DIFF = { key: "difficulty", label: "Difficulty level", type: "select", options: LEVELS };
const F_DEADLINE = { key: "deadline", label: "Deadline date", type: "date" };
const F_ASSIGNED = { key: "assignedBy", label: "Assigned by", type: "select", options: [] };
// Fields used by company-based interviews.
const ASSIGN_FIELDS = [F_COMPANY, F_ROLE, F_EXP, F_MODE, F_DURATION, F_DEADLINE, F_ASSIGNED];
// Fields required for real-time interviews.
const REALTIME_FIELDS = [
  F_COMPANY,
  F_ASSIGNED,
  { key: "stage", label: "Stage", type: "select", options: STAGES, placeholder: "Select stage" },
  { key: "date", label: "Scheduled date", type: "date" },
  { key: "time", label: "Scheduled time", type: "time" },
  F_DURATION,
  F_DEADLINE,
  { key: "status", label: "Status", type: "select", options: STATUSES },
  { key: "link", label: "Meeting link", type: "url", ph: "https://meet.google.com/...", full: true },
];
// Fields required for in-person interviews.
const IN_PERSON_FIELDS = [
  F_MODE,
  F_DURATION,
  F_DEADLINE,
  F_ASSIGNED,
  { key: "link", label: "Meeting link", type: "url", ph: "https://meet.google.com/...", full: true },
];
// Fields required for resume-based interviews.
const RESUME_FIELDS = [F_ROLE, F_EXP, F_MODE, F_DURATION, F_DIFF, F_DEADLINE, F_ASSIGNED];
// Map each interview format to its form fields.
const FIELDS = {
  company: ASSIGN_FIELDS,
  resume: RESUME_FIELDS,
  realtime: REALTIME_FIELDS,
  in_person: IN_PERSON_FIELDS,
};
// Check which interview formats require scheduling dates or meeting links.
const HAS_SCHEDULE = (type) => FIELDS[type].some((f) => f.key === "date");
const HAS_LINK = (type) => FIELDS[type].some((f) => f.key === "link");
// Use local date parts to avoid UTC shifting the selected calendar date.
const pad = (n) => String(n).padStart(2, "0");
const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const todayStr = () => iso(new Date());
const tomorrowStr = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return iso(date);
};
// Default values used when a new interview form opens.
const emptyForm = () => ({
  company: "",
  assignedBy: "",
  role: "",
  experience: "Fresher",
  mode: "technical",
  difficulty: "easy",
  duration: "30",
  deadline: "",
  stage: "",
  date: tomorrowStr(),
  time: "10:00",
  link: "",
  status: "Scheduled",
  resumeFile: null,
});
// Normalize meeting links and reject invalid URLs or unsupported protocols.
const toSafeUrl = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw || /\s/.test(raw)) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) && !/^https?:\/\//i.test(raw)) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    // Accept only valid HTTP(S) URLs with a hostname.
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname ? candidate : null;
  } catch {
    return null;
  }
};
// Meeting links must use HTTP or HTTPS.
const isHttpUrl = (value) => /^https?:\/\//i.test(String(value ?? "").trim()) && toSafeUrl(value) !== null;

/* FORM VALIDATION */
function validate(type, form) {
  const errors = {};
  FIELDS[type].forEach((field) => {
    if (!field.optional && !String(form[field.key] ?? "").trim()) {
      errors[field.key] = `${field.label} is required`;
    }
  });
  // Dates are compared as local YYYY-MM-DD strings, so they sort correctly.
  if (!errors.date && HAS_SCHEDULE(type) && form.date < todayStr()) {
    errors.date = "Date can't be in the past";
  }
  if (!errors.link && HAS_LINK(type) && !isHttpUrl(form.link)) {
    errors.link = "Enter a valid link starting with http(s)://";
  }
  if (!errors.deadline && form.deadline) {
    const min = HAS_SCHEDULE(type) ? form.date : todayStr();
    if (form.deadline < min) {
      errors.deadline = HAS_SCHEDULE(type) ? "Must be on/after the scheduled date" : "Can't be in the past";
    }
  }
  if (type === "resume") {
    if (!form.resumeFile) {
      errors.resumeFile = "Please upload a resume before creating this interview.";
    } else if (!/\.(pdf|doc|docx)$/i.test(form.resumeFile.name)) {
      errors.resumeFile = "Upload a PDF, DOC, or DOCX file.";
    }
  }
  // Return field-specific messages so the UI can show errors beside the right controls.
  return errors;
}

// Focus the first invalid field so it can be corrected immediately.
const focusFirstError = (type, errors) => {
  const order = [...(type === "resume" ? ["resumeFile"] : []), ...FIELDS[type].map((f) => f.key)];
  const key = order.find((k) => errors[k]);
  if (key) document.getElementById(key === "resumeFile" ? "resume-file" : `field-${key}`)?.focus();
};
// Keep input styling consistent across the form.
const inputCls = (error) => `h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${error ? "border-rose-400 focus:ring-2 focus:ring-rose-100" : `border-gray-200 ${T.focus}`}`;

/* MODAL KEYBOARD ACCESSIBILITY */
function useDialog(onClose, canClose = true) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus();
    return () => previous?.focus?.();
  }, []);
  const onKeyDown = (event) => {
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
    if (event.shiftKey && (active === first || active === ref.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };
  // Return the ref and keyboard handler used by the modal.
  return { ref, onKeyDown };
}

function Field({ label, error, full, required, htmlFor, children }) {
  // Keep each field label, control, and validation message together.
  return (
    <div className={`min-w-0 ${full ? "sm:col-span-2" : ""}`}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
// Render a styled dropdown with loading and API error states.
function CustomSelect({ field, id, value, error, onChange, disabled, loading = false, loadError = "", onRetry }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(224);
  const wrapperRef = useRef(null);
  const selected = field.options.find((option) => option.v === value);
  const placeholder = field.placeholder || "Select an option";
  // Close this dropdown when the user clicks outside it or presses Escape.
  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);
  // Open the dropdown upward when there is not enough space below it.
  const toggleOpen = () => {
    if (disabled || (field.key === "assignedBy" && loading)) return;
    if (open) {
      setOpen(false);
      return;
    }
    const trigger = wrapperRef.current?.querySelector("button");
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const scrollArea = trigger.closest(".overflow-y-auto");
      const bounds = scrollArea?.getBoundingClientRect() || { top: 0, bottom: window.innerHeight };
      const spaceAbove = Math.max(0, rect.top - bounds.top - 8);
      const spaceBelow = Math.max(0, bounds.bottom - rect.bottom - 8);
      const expectedHeight = Math.min(224, Math.max(80, field.options.length * 40 + 16));
      const shouldOpenUp = spaceBelow < expectedHeight && spaceAbove > spaceBelow;
      const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;
      setOpenUp(shouldOpenUp);
      setMenuMaxHeight(Math.max(80, Math.min(224, availableSpace)));
    }
    setOpen(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        id={id}
        type="button"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || (field.key === "assignedBy" && loading)}
        onClick={toggleOpen}
        className={`${inputCls(error)} flex items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
      >
        <span className={selected ? "truncate" : "truncate text-gray-400"}>
          {selected?.l || (field.key === "assignedBy" && loading ? "Loading employees..." : placeholder)}
        </span>
        <FiChevronDown className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} size={16} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={field.label}
          style={{ maxHeight: `${menuMaxHeight}px` }}
          className={`absolute left-0 z-[70] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl ${openUp ? "bottom-full mb-1" : "top-full mt-1"}`}
        >
          {field.key === "assignedBy" && loadError ? (
            <div className="px-3 py-2.5">
              <p className="text-sm text-rose-600">{loadError}</p>
              <button type="button" onClick={onRetry} className="mt-2 text-sm font-semibold text-green-800 hover:text-green-900">
                Retry
              </button>
            </div>
          ) : field.options.length ? (
            field.options.map((option) => (
              <label
                key={option.v}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition cursor-pointer ${option.v === value ? "bg-gray-100 font-medium text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name={id}
                  checked={option.v === value}
                  onChange={() => {
                    onChange(option.v);
                    setOpen(false);
                  }}
                  className="accent-green-700"
                />
                <span className="min-w-0 break-words">{option.l}</span>
              </label>
            ))
          ) : (
            <p className="px-3 py-2.5 text-sm text-gray-500">
              {field.key === "assignedBy" ? "No employee IDs found." : "No options available"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, id, value, error, onChange, min, disabled = false, loading = false, loadError = "", onRetry }) {
  const a11y = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  // Use the custom dropdown for select fields and a native input for other field types.
  if (field.type === "select") {
    // Pass employee-loading and retry state to the Assigned by dropdown.
    return <CustomSelect field={field} id={id} value={value} error={error} onChange={onChange} disabled={disabled} loading={loading} loadError={loadError} onRetry={onRetry} />;
  }
  // Render text, date, time, and meeting-link fields with a native input.
  return (
    <input
      {...a11y}
      type={field.type === "url" ? "text" : field.type}
      value={value}
      disabled={disabled}
      min={field.type === "date" ? min : undefined}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.ph}
      className={inputCls(error)}
    />
  );
}
// Manage interview form state, employee options, validation, and submission.
function ScheduleInterviewModal({ onClose, onCreate }) {
  const [type, setType] = useState("company");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeLoadError, setEmployeeLoadError] = useState("");
  const [employeeReload, setEmployeeReload] = useState(0);
  const [submitProgress, setSubmitProgress] = useState("");
  const [apiError, setApiError] = useState(null);
  // Prevent duplicate submissions while a request is in progress.
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const dialog = useDialog(onClose, !submitting);
  // Load employee IDs for Assigned by and cancel the request when the modal closes.
  useEffect(() => {
    const controller = new AbortController();

    const baseUrl = API_BASE_URL;

    if (!baseUrl) {
      setEmployeeLoadError("Employee list is unavailable because the API URL is not configured.");
      setEmployeesLoading(false);
      return () => controller.abort();
    }
    // Load employee IDs from the backend for the Assigned by dropdown.
    const loadEmployeeIds = async () => {
      setEmployeesLoading(true);
      setEmployeeLoadError("");
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}/employee-ids`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const responseMessage = errorData?.detail || errorData?.message;
          const error = new Error(
            typeof responseMessage === "string" && responseMessage.trim()
              ? responseMessage
              : "Unable to load employee IDs."
          );
          error.status = response.status;
          error.response = {
            status: response.status,
            data: errorData,
          };
          throw error;
        }
        const data = await response.json();
        // Ensure the API returns an array before creating dropdown options.
        if (!Array.isArray(data)) throw new Error("Unexpected employee list response.");
        setEmployeeIds(data.map((item) => ({ v: item, l: item })));
      } catch (error) {
        if (error.name === "AbortError") return;

        if (
          error?.response?.status === 401 ||
          error?.status === 401
        ) {
          setApiError(null);
          window.dispatchEvent(new Event("session-expired"));
          return;
        }

        const fallbackMessage = getApiErrorMessage(
          error,
          "Unable to load employee IDs. Please try again."
        );
        const responseMessage =
          error?.response?.data?.detail || error?.response?.data?.message;
        const message =
          typeof responseMessage === "string" && responseMessage.trim()
            ? responseMessage
            : fallbackMessage;

        setApiError({
          title: "Unable to Load Employee IDs",
          message,
        });
      } finally {
        if (!controller.signal.aborted) setEmployeesLoading(false);
      }
    };
    loadEmployeeIds();
    return () => controller.abort();
  }, [employeeReload]);

  // Track unmounting so an in-flight submission does not update stale component state.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // Update a field and clear its previous validation error.
  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  // Validate the form before creating the interview and prevent duplicate requests.
  const submit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    const validationErrors = validate(type, form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      focusFirstError(type, validationErrors);
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setSubmitProgress(type === "resume" ? "Preparing resume upload..." : "Creating interview...");
    try {
      await onCreate(type, form, setSubmitProgress);
    } finally {
      inFlight.current = false;
      // Avoid updating component state after the modal unmounts.
      if (mounted.current) {
        setSubmitting(false);
        setSubmitProgress("");
      }
    }
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const current = TYPES.find((item) => item.id === type);
  // Render the selected interview format and its configured fields.
  return (
    <>
      {apiError && (
        <ApiErrorModal
          title={apiError.title}
          message={apiError.message}
          onRetry={() => {
            setApiError(null);
            setEmployeeReload((current) => current + 1);
          }}
          onClose={() => setApiError(null)}
        />
      )}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-3 sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !submitting) onClose();
        }}
      >
        <form
          ref={dialog.ref}
          onKeyDown={dialog.onKeyDown}
          onSubmit={submit}
          noValidate
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-modal-title"
          tabIndex={-1}
          className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
        >
          <div className="flex items-center justify-between px-6 pb-4 pt-5">
            <div>
              <h2 id="schedule-modal-title" className="text-lg font-semibold text-gray-900">
                Schedule interview
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">Choose a format, then fill in the details.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto border-t border-gray-100 px-6 py-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Interview format</p>
            <div role="radiogroup" aria-label="Interview format" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TYPES.map((item) => {
                const Icon = item.icon;
                const active = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={submitting}
                    onClick={() => {
                      setType(item.id);
                      setErrors({});
                    }}
                    className={`group relative flex items-start gap-3 rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${active ? "border-green-800 bg-green-50/70 shadow-sm" : "border-gray-200 bg-white hover:border-green-300 hover:bg-[#F9FAFB]"}`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${active ? "bg-green-800 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-800"}`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1 pr-5">
                      <span className={`block text-sm font-semibold ${active ? "text-green-900" : "text-gray-900"}`}>
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-gray-500">{item.desc}</span>
                    </span>
                    <span
                      className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-green-800 bg-green-800 text-white" : "border-gray-300 bg-white text-transparent"}`}
                    >
                      <FiCheck size={12} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
            {type === "resume" && (
              <div className="mt-6 rounded-xl border border-[#e7dccf] bg-[#F9FAFB] p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${T.brownSoft}`}>
                    <FiUploadCloud size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">Upload resume</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Choose the candidate's resume before scheduling. PDF, DOC, and DOCX files are accepted.
                    </p>
                  </div>
                </div>
                <input
                  id="resume-file"
                  type="file"
                  aria-label="Upload resume"
                  aria-invalid={errors.resumeFile ? true : undefined}
                  aria-describedby={errors.resumeFile ? "resume-file-error" : undefined}
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={submitting}
                  onChange={(event) => set("resumeFile", event.target.files?.[0] || null)}
                  className="mt-4 block w-full cursor-pointer text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#f1e6da] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#5a361e] hover:file:bg-[#eadbc8]"
                />
                {form.resumeFile && <p className="mt-2 break-all text-xs text-gray-600">Selected: {form.resumeFile.name}</p>}
                {errors.resumeFile && (
                  <p id="resume-file-error" role="alert" className="mt-1 text-xs text-rose-600">
                    {errors.resumeFile}
                  </p>
                )}
              </div>
            )}
            {submitting && (
              <div
                className="mt-5 flex items-center gap-3 rounded-lg border border-[#e7dccf] bg-[#f8f6f2] px-4 py-3"
                role="status"
                aria-live="polite"
              >
                <FiLoader className="shrink-0 animate-spin text-green-700" size={18} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{submitProgress || "Processing your request..."}</p>
                  <p className="mt-0.5 text-xs text-gray-500">Please wait and keep this window open.</p>
                </div>
              </div>
            )}
            <div className="mb-3 mt-6 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{current.title} details</p>
              <p className="text-xs text-gray-500">
                <span className="text-rose-500">*</span> Required
              </p>
            </div>
            {/* Render fields from the selected interview type's configuration. */}
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              {FIELDS[type].map((field) => (
                <Field
                  key={field.key}
                  htmlFor={`field-${field.key}`}
                  label={field.label}
                  error={errors[field.key]}
                  full={field.full}
                  required={!field.optional}
                >
                  <FieldInput
                    field={field.key === "assignedBy" ? {
                      ...field,
                      options: employeeIds,
                      placeholder: employeesLoading ? "Loading employees..." : "Select employee",
                    } : field}
                    id={`field-${field.key}`}
                    disabled={submitting}
                    value={form[field.key]}
                    error={errors[field.key]}
                    onChange={(value) => set(field.key, value)}
                    loading={field.key === "assignedBy" && employeesLoading}
                    loadError={field.key === "assignedBy" ? employeeLoadError : ""}
                    onRetry={() => setEmployeeReload((current) => current + 1)}
                    min={field.key === "deadline" && HAS_SCHEDULE(type) ? form.date || todayStr() : todayStr()}
                  />
                </Field>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-[#F9FAFB] px-6 py-4">
            <p className={`text-xs ${errorCount ? "text-rose-600" : "text-transparent"}`} aria-live="polite">
              {errorCount ? `Please fix ${errorCount} highlighted field${errorCount > 1 ? "s" : ""}.` : "."}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${T.primary}`}
              >
                {submitting ? "Saving..." : "Schedule interview"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
export default ScheduleInterviewModal;