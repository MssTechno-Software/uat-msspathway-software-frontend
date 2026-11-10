import { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiLoader } from "react-icons/fi";
import { CalendarDays, Clock3, X, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../api/axios";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "./ApiErrorModal";
import { getAccessToken } from "../services/authSession";

// Keep the HTTP status on the error so the shared handler can identify API failures.
const createApiError = (status, message = "") => {
  const error = new Error(message || `Request failed (${status})`);
  error.status = status;
  error.response = { status };
  return error;
};

function Leave() {
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [singleDate, setSingleDate] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Stores the leave balance returned by the backend.
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Controls the success/error popup and the shared API error modal.
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [showPopup, setShowPopup] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Show a short message after an action succeeds or needs correction.
  const openPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  // Handle expired sessions separately; show other API errors with an optional retry action.
  const showApiError = useCallback((error, title, fallbackMessage, onRetry) => {
    if (error?.response?.status === 401 || error?.status === 401) {
      setApiError(null);
      window.dispatchEvent(new Event("session-expired"));
      return;
    }

    setApiError({
      title,
      message: getApiErrorMessage(error, fallbackMessage),
      onRetry,
    });
  }, []);

  /* FETCH LEAVE BALANCE */
  const fetchLeaveBalance = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      return;
    }

    try {
      setBalanceLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/timesheet/leave-balance`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw createApiError(response.status, errorText);
      }

      const data = await response.json();

      // Store the latest balance so the modal and validation use backend values.
      setLeaveBalance(data);
    } catch (error) {
      setLeaveBalance(null);
      showApiError(
        error,
        "Unable to Load Leave Balance",
        "Unable to load leave balance. Please try again.",
        fetchLeaveBalance
      );
    } finally {
      setBalanceLoading(false);
    }
  }, [showApiError]);

  /* OPEN LEAVE MODAL FROM THE APP EVENT */
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === "open-leave-modal") {
        setOpen(true);

        if (!leaveBalance) {
          fetchLeaveBalance();
        }
      }
    };

    window.addEventListener("leave-event", handler);

    return () => {
      window.removeEventListener("leave-event", handler);
    };
  }, [leaveBalance, fetchLeaveBalance]);

  /* FORMAT DATE FOR THE API (YYYY-MM-DD) */
  const formatDate = (date) => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* COUNT BOTH THE START AND END DATES */
  const calculateRequestedDays = () => {
    if (!from || !to) return 0;

    const start = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );

    const end = new Date(
      to.getFullYear(),
      to.getMonth(),
      to.getDate()
    );

    const difference = end.getTime() - start.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  };

  /* APPLY FOR LEAVE */
  const applyLeave = async () => {
    if (!leaveType || !reason.trim()) {
      openPopup("Please fill all required fields", "error");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      openPopup("Bad token.", "error");
      return;
    }

    // Build one request shape; fill the date fields based on the selected leave type.
    let payload = {
      leave_type:
        leaveType === "single" ? "one_day" : "multiple_days",
      leave_date: null,
      start_date: null,
      end_date: null,
      description: reason,
    };

    let requestedLeaveDays = 0;

    /* SINGLE-DAY LEAVE */
    if (leaveType === "single") {
      if (!singleDate) {
        openPopup("Please select date", "error");
        return;
      }

      requestedLeaveDays = 1;

      payload.leave_date = formatDate(singleDate);
    }

    /* MULTI-DAY LEAVE */
    if (leaveType === "multiple") {
      if (!from || !to) {
        openPopup("Please select start and end date", "error");
        return;
      }

      if (to < from) {
        openPopup("End date cannot be before start date", "error");
        return;
      }

      requestedLeaveDays = calculateRequestedDays();

      payload.start_date = formatDate(from);
      payload.end_date = formatDate(to);
    }

    /* CHECK THE REQUEST AGAINST THE AVAILABLE BALANCE */

    const availableLeave = Number(leaveBalance?.available ?? 0);

    if (requestedLeaveDays > availableLeave) {
      openPopup(
        `You have only ${availableLeave} leave day${availableLeave === 1 ? "" : "s"
        } available. You cannot apply for ${requestedLeaveDays} day${requestedLeaveDays === 1 ? "" : "s"
        }.`,
        "error"
      );

      return;
    }

    /* SUBMIT LEAVE REQUEST */
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/timesheet/Leaveapply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw createApiError(response.status, errorText);
      }

      await response.json();

      openPopup("Leave Applied Successfully", "success");

      window.dispatchEvent(new Event("timesheetSubmitted"));

      // Notify other timesheet views to refresh their leave data.
      window.dispatchEvent(new Event("leaveRequestUpdated"));

      // Reload the balance so the remaining days stay up to date.
      fetchLeaveBalance();

      // Clear the modal fields after a successful request.
      setOpen(false);
      setLeaveType("");
      setSingleDate(null);
      setFrom(null);
      setTo(null);
      setReason("");
    } catch (error) {
      showApiError(
        error,
        "Unable to Apply for Leave",
        "Unable to apply for leave. Please try again.",
        applyLeave
      );
    } finally {
      setLoading(false);
    }
  };

  /* CLOSE MODAL AND RESET FORM */
  const closeLeaveModal = () => {
    if (loading) return;

    setOpen(false);
    setLeaveType("");
    setSingleDate(null);
    setFrom(null);
    setTo(null);
    setReason("");
  };

  /* UPDATE THE REQUESTED-DAY COUNT AS DATES CHANGE */
  const liveRequestedDays =
    leaveType === "single"
      ? singleDate
        ? 1
        : 0
      : leaveType === "multiple"
        ? from && to && to >= from
          ? calculateRequestedDays()
          : 0
        : 0;

  // Disable submission when the selected range exceeds the available balance.
  const availableLeave = Number(leaveBalance?.available ?? 0);

  const isBalanceExceeded =
    liveRequestedDays > 0 && liveRequestedDays > availableLeave;

  return (
    <>
      {/* Show the shared API error modal when a request fails. */}
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
      {/* Leave application modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4 py-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  Apply for Leave
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Submit your leave request
                </p>
              </div>

              <button
                type="button"
                onClick={closeLeaveModal}
                disabled={loading}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="px-6 pt-3 shrink-0">
              <div className="rounded-2xl border border-green-100 bg-green-50/70 px-4 py-3">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center">
                      <Clock3 size={19} className="text-white" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Available Leave
                      </p>

                      {balanceLoading ? (
                        <div className="flex items-center gap-2 mt-1">
                          <FiLoader className="animate-spin text-green-700" size={16} />
                          <span className="text-xs text-gray-500">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-green-800">
                            {leaveBalance?.available ?? "0"}
                          </span>

                          <span className="text-xs font-medium text-gray-500">
                            days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {leaveBalance && (
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400">
                        {leaveBalance.year}
                      </p>

                      <p className="text-xs text-green-700 font-medium mt-1">
                        {leaveBalance.used} used
                      </p>
                    </div>
                  )}
                </div>

                {/* Show entitlement, used, and pending days when balance data is available. */}
                {leaveBalance && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-green-100">

                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Entitled
                      </p>

                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {leaveBalance.annual_entitlement}
                      </p>
                    </div>

                    <div className="text-center border-x border-green-100">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Used
                      </p>

                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {leaveBalance.used}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Pending
                      </p>

                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {leaveBalance.pending}
                      </p>
                    </div>

                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 overflow-y-auto min-h-0">

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Leave Type
                </p>

                <div className="grid grid-cols-2 gap-3">

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${leaveType === "single"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    <input
                      type="radio"
                      value="single"
                      checked={leaveType === "single"}
                      onChange={() => {
                        setLeaveType("single");
                        setFrom(null);
                        setTo(null);
                      }}
                      className="accent-green-700"
                    />

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        1 Day Leave
                      </p>

                      <p className="text-[11px] text-gray-400">
                        Single day
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${leaveType === "multiple"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    <input
                      type="radio"
                      value="multiple"
                      checked={leaveType === "multiple"}
                      onChange={() => {
                        setLeaveType("multiple");
                        setSingleDate(null);
                      }}
                      className="accent-green-700"
                    />

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Multiple Days
                      </p>

                      <p className="text-[11px] text-gray-400">
                        Date range
                      </p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Show the date fields that match the selected leave type. */}
              {leaveType && (
                <div className="space-y-3">

                  {leaveType === "single" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Date <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                        />

                        <DatePicker
                          placeholderText="dd-mm-yyyy"
                          selected={singleDate}
                          onChange={(date) => setSingleDate(date)}
                          dateFormat="dd-MM-yyyy"
                          wrapperClassName="w-full"
                          className="w-full border border-gray-200 p-2.5 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                          shouldCloseOnSelect={true}
                          closeOnScroll={false}
                          onClickOutside={(e) => e.preventDefault()}
                        />
                      </div>
                    </div>
                  )}

                  {leaveType === "multiple" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Start Date <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <CalendarDays
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                          />

                          <DatePicker
                            placeholderText="dd-mm-yyyy"
                            selected={from}
                            onChange={(date) => setFrom(date)}
                            dateFormat="dd-MM-yyyy"
                            wrapperClassName="w-full"
                            className="w-full border border-gray-200 p-2.5 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                            shouldCloseOnSelect={true}
                            closeOnScroll={false}
                            onClickOutside={(e) => e.preventDefault()}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          End Date <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <CalendarDays
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                          />

                          <DatePicker
                            placeholderText="dd-mm-yyyy"
                            selected={to}
                            onChange={(date) => setTo(date)}
                            minDate={from || null}
                            dateFormat="dd-MM-yyyy"
                            wrapperClassName="w-full"
                            className="w-full border border-gray-200 p-2.5 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                            shouldCloseOnSelect={true}
                            closeOnScroll={false}
                            onClickOutside={(e) => e.preventDefault()}
                          />
                        </div>
                      </div>

                      {/* Warn the user before submission if the requested days exceed the balance. */}
                      {liveRequestedDays > 0 && (
                        <div
                          className={`rounded-xl px-4 py-3 border ${isBalanceExceeded
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                            }`}
                        >
                          <div className="flex items-center justify-between">

                            <div className="flex items-center gap-2">
                              {isBalanceExceeded ? (
                                <AlertCircle
                                  size={17}
                                  className="text-red-600"
                                />
                              ) : (
                                <Clock3
                                  size={17}
                                  className="text-green-700"
                                />
                              )}

                              <span className="text-sm font-medium text-gray-700">
                                Requested Leave
                              </span>
                            </div>

                            <span
                              className={`text-sm font-bold ${isBalanceExceeded
                                ? "text-red-600"
                                : "text-green-700"
                                }`}
                            >
                              {liveRequestedDays}{" "}
                              {liveRequestedDays === 1 ? "Day" : "Days"}
                            </span>

                          </div>

                          {isBalanceExceeded && (
                            <p className="text-[11px] leading-4 text-red-600 mt-1.5">
                              You have only {availableLeave}{" "}
                              {availableLeave === 1 ? "day" : "days"} available.
                              Please select a shorter leave period.
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Enter reason for leave..."
                      className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none resize-none"
                    />
                  </div>

                </div>
              )}
            </div>

            {/* Modal actions: cancel the request or submit it. */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">

              <button
                onClick={closeLeaveModal}
                disabled={loading}
                className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={applyLeave}
                disabled={
                  !leaveType ||
                  loading ||
                  balanceLoading ||
                  isBalanceExceeded
                }
                className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white transition flex items-center gap-2 ${!leaveType ||
                  loading ||
                  balanceLoading ||
                  isBalanceExceeded
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-800 hover:bg-green-700"
                  }`}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply Leave"
                )}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Display success and validation messages in a separate popup. */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-[100]">
          <div className="bg-white w-full max-w-xs p-6 rounded-lg shadow-lg text-center">
            <h3
              className={`text-lg font-semibold mb-2 ${popupType === "error" ? "text-red-600" : "text-green-600"
                }`}
            >
              {popupType === "error" ? "Error" : "Success"}
            </h3>

            <p className="text-gray-600 text-sm">{popupMessage}</p>

            <button
              onClick={() => setShowPopup(false)}
              className="mt-5 px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </>
  );
}

export default Leave;