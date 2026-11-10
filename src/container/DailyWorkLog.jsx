import { useCallback, useEffect, useState } from "react";
import { Save, Calendar as CalendarIcon, Edit, Trash } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import { API_BASE_URL } from "../api/axios";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "./ApiErrorModal";
import { getAccessToken, getUserId } from "../services/authSession";
// Keep all timesheet endpoints under the shared API base URL.
const BASE_URL = `${API_BASE_URL}/timesheet`;

// Normalize fetch failures so the shared API error handler can read the HTTP status.
const createApiError = (status, message = "") => {
  const error = new Error(message || `Request failed with status ${status}`);
  error.response = { status };
  if (message) error.apiMessage = message;
  return error;
};

const EMPTY_FORM = {
  project: "",
  category: "",
  breakTime: "",
  startTime: "",
  endTime: "",
  task_description: "",
};

// Calculate total work hours after subtracting the break duration.
const calculateHours = (start, end, breakMin) => {
  if (!start || !end) return 0;
  const s = new Date(`1970-01-01T${start}`);
  const e = new Date(`1970-01-01T${end}`);
  let mins = (e - s) / 60000;
  mins -= Number(breakMin || 0);
  return (mins / 60).toFixed(1);
};

function DailyWorkLog(props) {
  if (!props.selectedDate) return null;

  return <DailyWorkLogContent {...props} />;
}

function DailyWorkLogContent({ selectedDate, isLeave, isPublicHoliday }) {

  const userId = getUserId();
  // Format the selected date to match the API date parameter (YYYY-MM-DD).
  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  // Work logs are locked for weekends, leave days, holidays, submitted days, and past/future dates.
  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);
  const isNotToday = selected.getTime() !== today.getTime();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [entries, setEntries] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [holidayDescription, setHolidayDescription] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  // Track whether the shared popup should display a success or error message.
  const [popupType, setPopupType] = useState("success");
  const [showPopup, setShowPopup] = useState(false);
  const [apiError, setApiError] = useState(null);

  const isDisabled = isWeekend || isLeave || isPublicHoliday || submitted || isNotToday;

  const openPopup = (message, type) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  // Route authentication failures to session expiry and show other API errors in the modal.
  const showApiError = useCallback((error, title, fallbackMessage, onRetry) => {
    if (error?.response?.status === 401) {
      setApiError(null);
      window.dispatchEvent(new Event("session-expired"));
      return;
    }

    setApiError({
      title,
      message: error?.apiMessage || getApiErrorMessage(error, fallbackMessage),
      onRetry,
    });
  }, []);

  // Fetch drafts for the selected date and convert API fields to the form/list format.
  const fetchDrafts = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      setLoading(true);
      // Retrieve the selected day's drafts using the logged-in user's token.
      const response = await fetch(
        `${BASE_URL}/draft/${dateKey}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw createApiError(response.status);

      const data = await response.json();

      // Normalize API response fields for the activity list and hour calculation.
      const formatted = data.map((item) => ({
        project: item.project_name,
        category: item.task_name,
        startTime: item.start_time?.slice(0, 5),
        endTime: item.end_time?.slice(0, 5),
        breakTime: item.break_time,
        task_description: "",
        draft_id: item.id || item.draft_id, // Retain the draft ID for later update and delete requests.
        hours: calculateHours(
          item.start_time?.slice(0, 5),
          item.end_time?.slice(0, 5),
          item.break_time
        ),
        status: item.status || "Draft",
      }));

      setEntries(formatted);
      let isSubmitted = false;

      if (data.length > 0) {
        isSubmitted = data.some(
          (item) => item.status?.toLowerCase() === "submitted"
        );
      }
      // Preserve the submitted state if the API returns no drafts after submission.
      const submittedFlag = localStorage.getItem(`submitted_${dateKey}`);
      if (submittedFlag === "true") {
        isSubmitted = true;
      }

      setSubmitted(isSubmitted);

    } catch (error) {
      setEntries([]);
      showApiError(
        error,
        "Unable to Load Timesheets",
        "Unable to load timesheet drafts. Please try again.",
        fetchDrafts
      );
    } finally {
      setLoading(false);
    }
  }, [dateKey, showApiError]);
  // Load the saved drafts whenever the selected date changes.
  useEffect(() => {
    fetchDrafts();
    setFormData(EMPTY_FORM);
    setEditIndex(null);
  }, [fetchDrafts]);

  // Fetch the holiday description only when the selected date is a public holiday.
  useEffect(() => {
    const fetchHoliday = async () => {
      const token = getAccessToken();
      if (!token || !isPublicHoliday) {
        setHolidayDescription("");
        return;
      }
      try {
        // Load the holiday description for the selected date.
        const response = await fetch(
          `${API_BASE_URL}/calendar/public-holidays/date/${dateKey}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) throw createApiError(response.status);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setHolidayDescription(
            data[0]?.description || "Public Holiday"
          );

        } else {
          setHolidayDescription("Public Holiday");
        }
      } catch (error) {
        setHolidayDescription("Public Holiday");
        showApiError(
          error,
          "Unable to Load Holiday Details",
          "Unable to load holiday details. Please try again.",
          fetchHoliday
        );
      }
    };
    fetchHoliday();
  }, [dateKey, isPublicHoliday, showApiError]);

  // Save a new draft or update the selected draft.
  const saveLog = async (e) => {
    e.preventDefault();
    if (submitted) {
      openPopup("Day already submitted. No changes allowed ❌", "error");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      openPopup("Invalid token ❌", "error");
      return;
    }

    // Validate required fields before sending the timesheet to the API.
    if (
      !formData.project.trim() ||
      !formData.category.trim() ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.task_description.trim()
    ) {
      openPopup("Please fill in all required fields ❌", "error");
      return;
    }

    // Reject invalid durations, including breaks that exceed the work interval.
    const hours = calculateHours(
      formData.startTime,
      formData.endTime,
      formData.breakTime
    );

    if (hours <= 0) {
      openPopup("End time must be after start time, and break time must be less than total time ❌", "error");
      return;
    }

    // Match the request payload keys expected by the timesheet backend.
    const payload = {
      project_name: formData.project,
      task_name: formData.category,
      start_time: `${formData.startTime}:00`,
      end_time: `${formData.endTime}:00`,
      break_time: Number(formData.breakTime || 0),
      task_description: formData.task_description,
      work_date: dateKey,
      user_id: userId,
    };

    try {
      setLoading(true);
      let response;

      // Update the existing draft using its saved draft ID.
      if (editIndex !== null) {
        const draftId = entries[editIndex].draft_id;

        response = await fetch(
          `${BASE_URL}/update/${draftId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }

      // Create a new draft when no existing entry is being edited.
      else {
        response = await fetch(
          `${BASE_URL}/create_draft`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }
      const data = await response.json();
      // Surface backend validation messages when the save/update request fails.
      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || data.detail || data.error || ""
        );
      }
      await fetchDrafts();
      window.dispatchEvent(new Event("timesheetSubmitted"));
      setFormData(EMPTY_FORM);
      setEditIndex(null);

      openPopup(
        data.message || data.detail ||
        (editIndex !== null
          ? "Timesheet updated successfully ✅"
          : "Timesheet saved successfully ✅"),
        "success"
      );
    } catch (error) {
      showApiError(
        error,
        "Unable to Save Timesheet",
        "Unable to save the timesheet. Please try again.",
        () => saveLog({ preventDefault: () => { } })
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete the selected draft, then refresh the day's entries.
  const deleteEntry = async (index) => {
    if (submitted) return;

    const token = getAccessToken();
    const draftId = entries[index].draft_id;

    try {
      setLoading(true);
      // Send the delete request for the selected draft ID.
      const response = await fetch(
        `${BASE_URL}/delete/${draftId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw createApiError(
          response.status,
          data.detail || data.message || ""
        );
      }
      await fetchDrafts();
      window.dispatchEvent(new Event("timesheetSubmitted"));
      openPopup(
        data.message || data.detail || "Timesheet Deleted ✅",
        "success"
      );
    } catch (error) {
      showApiError(
        error,
        "Unable to Delete Timesheet",
        "Unable to delete the timesheet. Please try again.",
        () => deleteEntry(index)
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit the selected day and lock it after a successful response.
  const submitDay = async () => {
    if (submitted) return;


    const token = getAccessToken();
    try {
      setLoading(true);
      // Send the selected work date to the submit endpoint.
      const response = await fetch(
        `${BASE_URL}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            work_date: dateKey,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        window.dispatchEvent(new Event("timesheetSubmitted"));
        openPopup(
          data.message || "Day Submitted Successfully ✅",
          "success"
        );
        return;
      } else {
        showApiError(
          createApiError(
            response.status,
            data.detail || data.details || data.message || data.error || ""
          ),
          "Unable to Submit Timesheet",
          "Unable to submit the timesheet. Please try again.",
          submitDay
        );
      }
    } catch (error) {
      showApiError(
        error,
        "Unable to Submit Timesheet",
        "Unable to submit the timesheet. Please try again.",
        submitDay
      );
    } finally {
      setLoading(false);
    }
  };

  // Reload drafts from the API so the selected entry uses the latest saved values.
  const editEntry = async (index) => {
    if (isDisabled) return;
    const token = getAccessToken();
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/draft/${dateKey}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw createApiError(response.status);
      const data = await response.json();
      // Populate the form with the selected draft and enable update mode.
      const selectedDraft = data[index];
      setFormData({
        project: selectedDraft.project_name || "",
        category: selectedDraft.task_name || "",
        startTime: selectedDraft.start_time?.slice(0, 5) || "",
        endTime: selectedDraft.end_time?.slice(0, 5) || "",
        breakTime: selectedDraft.break_time || "",
        task_description: selectedDraft.task_description || "",
      });
      setEditIndex(index);
    } catch (error) {
      showApiError(
        error,
        "Unable to Load Draft",
        "Unable to load the selected draft. Please try again.",
        () => editEntry(index)
      );
    } finally {
      setLoading(false);
    }
  };

  // Close the delete confirmation after the delete handler finishes.
  const confirmDelete = async () => {
    await deleteEntry(deleteIndex);
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  // Close the submit confirmation after the submit handler finishes.
  const confirmSubmit = async () => {
    await submitDay();
    setShowSubmitModal(false);
  };

  // Sum the saved activity durations for the selected day.
  const totalHours = entries.reduce(
    (sum, e) => sum + Number(e.hours || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 w-full">
      {apiError && (
        <ApiErrorModal
          title={apiError.title}
          message={apiError.message}
          onRetry={apiError.onRetry ? () => {
            const retry = apiError.onRetry;
            setApiError(null);
            retry();
          } : undefined}
          onClose={() => setApiError(null)}
        />
      )}
      {/* Show a blocking loader while an API request is in progress. */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">

          <div className="p-6 flex flex-col items-center gap-4">

            <FiLoader className="animate-spin text-green-800 text-4xl" />

            <p className="text-gray-700 font-medium">
              Please wait...
            </p>

          </div>
        </div>
      )}
      {/* Selected date and page heading. */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Daily Work Log
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <CalendarIcon size={16} className="text-green-700" />
          <span>
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Work-log form. */}
      <div className={`space-y-6 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              disabled={isDisabled}
              value={formData.project}
              onChange={(e) =>
                setFormData({ ...formData, project: e.target.value })
              }
              placeholder="Project Name"
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Category <span className="text-red-500">*</span>
            </label>
            <input
              disabled={isDisabled}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Task Category "
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              disabled={isDisabled}
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              disabled={isDisabled}
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Break (min)
            </label>
            <input
              disabled={isDisabled}
              placeholder="Break (min)"
              value={formData.breakTime}
              onChange={(e) =>
                setFormData({ ...formData, breakTime: e.target.value })
              }
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Description <span className="text-red-500">*</span>
          </label>
          <textarea
            disabled={isDisabled}
            rows={4}
            placeholder="What have you achieved today?"
            value={formData.task_description}
            required
            onChange={(e) =>
              setFormData({ ...formData, task_description: e.target.value })
            }
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm resize-none"
          />
        </div>
      </div>

      {/* Save, reset, and edit actions. */}
      {!isDisabled && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-14 mt-8">
          {!submitted && (
            <button
              onClick={saveLog}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm w-full sm:max-w-45 text-white ${loading
                ? "bg-green-600 cursor-not-allowed"
                : "bg-green-800 hover:bg-green-700 cursor-pointer"
                }`}
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {editIndex !== null ? "Update" : "Save Timesheet"}
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              setFormData(EMPTY_FORM);
              setEditIndex(null); // Clear the form and leave edit mode.
            }}
            className="text-gray-400 text-sm"
          >
            {editIndex !== null ? "Cancel Edit" : "Reset"}
          </button>
        </div>
      )}

      {/* Explain why entries are disabled on weekends. */}
      {isWeekend && (
        <div className="bg-green-50 border-l-4 border-green-800 text-black-700 p-4 mt-6" role="alert">
          <p className="font-semibold">Weekend Notice</p>
          <p className="text-sm">Timesheet entries cannot be added or edited for weekends.</p>
        </div>
      )}

      {isLeave && (
        <div className="bg-green-50 border-l-4 border-green-800 text-black-700 p-4 mt-6" role="alert">
          <p className="font-semibold">Leave Notice</p>
          <p className="text-sm">You are on leave for this day. Timesheet entries cannot be added or edited.</p>
        </div>
      )}

      {isPublicHoliday && (
        <div className="bg-green-50 border-l-4 border-green-800 text-black-700 p-4 mt-6" role="alert">
          <p className="font-semibold">Public Holiday Notice</p>
          <p className="text-sm">
            {holidayDescription} is a public holiday. Timesheet entries cannot be added or edited.
          </p>
        </div>
      )}

      {isNotToday && !isWeekend && !isLeave && !isPublicHoliday && (
        <div
          className="bg-green-50 border-l-4 border-green-800 text-black-700 p-4 mt-6"
          role="alert"
        >
          <p className="font-semibold">
            Timesheet Locked
          </p>

          <p className="text-sm">
            Timesheets can only be added or edited for today.
          </p>
        </div>
      )}

      {/* Display the saved activities and daily total. */}
      <div className="mt-8">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold">Logged Activities</h3>
          <span className="text-green-600">{totalHours} hrs Total</span>
        </div>

        {entries.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">
            No logged activities for this day
          </p>
        )}

        {entries.map((e, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">{e.project}</div>
              <div className="text-sm text-gray-500">
                {e.category} | {e.startTime} - {e.endTime}
              </div>
            </div>

            {!isDisabled && (
              <div className="flex gap-3 self-end sm:self-auto">
                <button onClick={() => editEntry(i)} className="text-gray-400 hover:text-gray-600 transition" title="Edit"><Edit size={18} /></button>
                <button onClick={() => { setDeleteIndex(i); setShowDeleteModal(true); }} className="text-gray-400 hover:text-gray-600 transition" title="Delete"><Trash size={18} /> </button>
              </div>
            )}
          </div>
        ))}

        {submitted && (
          <div className="text-green-600 font-semibold mt-4 text-center">
            Day Submitted ✅
          </div>
        )}

        {!isDisabled && entries.length > 0 && (
          <button
            disabled={submitted}
            onClick={() => setShowSubmitModal(true)}
            className="bg-green-800 text-white px-6 py-3 rounded-xl mt-4 w-full hover:bg-green-700 cursor-pointer"
          >
            Submit Day
          </button>
        )}

        {/* Confirm deletion before removing a draft. */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Delete Draft</h2>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete this draft?
              </p>
              <div className="flex justify-end gap-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg text-white ${loading
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-green-800 hover:bg-green-700 cursor-pointer"
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm submission before locking the day. */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Submit Day</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to submit the day?
              </p>
              <div className="flex justify-end gap-6">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg text-white ${loading
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-green-800 hover:bg-green-700 cursor-pointer"
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show success and validation messages. */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">

              <h3
                className={`text-lg font-semibold mb-2 ${popupType === "error" ? "text-red-600" : "text-green-600"
                  }`}
              >
                {popupType === "error" ? "Error" : "Success"}
              </h3>

              <p className="text-gray-600 text-sm">
                {popupMessage}
              </p>

              <button
                onClick={() => setShowPopup(false)}
                className="mt-5 px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyWorkLog;
