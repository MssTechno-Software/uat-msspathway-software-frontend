
import { useState } from "react";
import {
  FiX,
  FiLoader
} from "react-icons/fi";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "./ApiErrorModal";

function LeaveRequestStatus({
  open,
  onClose,
  selectedRequest,
  onApprove,
  onReject
}) {
  // Track request progress and API errors.
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (!open || !selectedRequest) return null;

  // Approve the selected leave request.
  const handleApprove = async () => {
    try {
      setLoading(true);
      await onApprove(selectedRequest);
    } catch (error) {
      if (error?.response?.status === 401 || error?.status === 401) {
        setApiError(null);
        window.dispatchEvent(new Event("session-expired"));
        return;
      }

      setApiError({
        title: "Unable to Approve Leave",
        message: getApiErrorMessage(
          error,
          "Unable to approve the leave request. Please try again."
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  // Reject the selected leave request.
  const handleReject = async () => {
    try {
      setLoading(true);
      await onReject(selectedRequest);
    } catch (error) {
      if (error?.response?.status === 401 || error?.status === 401) {
        setApiError(null);
        window.dispatchEvent(new Event("session-expired"));
        return;
      }

      setApiError({
        title: "Unable to Reject Leave",
        message: getApiErrorMessage(
          error,
          "Unable to reject the leave request. Please try again."
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">

      {/* Show progress while the leave request is processing. */}
      {loading && (
        <div className="absolute inset-0 bg-black/40 z-9999 flex items-center justify-center">
          <div className="p-6 flex flex-col items-center gap-3">
            <FiLoader className="animate-spin text-4xl text-green-800" />
            <p className="text-white font-medium">
              Please wait...
            </p>
          </div>
        </div>
      )}

      {/* Display API errors with the shared error modal. */}
      {apiError && (
        <ApiErrorModal
          title={apiError.title}
          message={apiError.message}
          onClose={() => setApiError(null)}
        />
      )}

      <div className="w-96 max-w-xl rounded-3xl bg-[#FCFAF8] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-10">

          {/* HEADER */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1E130F]">
              Review Request
            </h2>

            <button
              disabled={loading}
              onClick={onClose}
              className="text-xl leading-none text-[#7C7873] hover:text-black cursor-pointer disabled:opacity-50"
            >
              <FiX />
            </button>
          </div>

          {/* EMPLOYEE CARD */}
          <div className="mb-10 rounded-2xl bg-[#FBF2EC] px-8 py-8 text-center">
            <p className="mb-3 text-sm uppercase text-[#8D847D]">
              Selected Request
            </p>

            <h3 className="text-md font-semibold text-[#1E130F]">
              {selectedRequest.employee_name ||
                selectedRequest.name ||
                "Employee"}
            </h3>

            <p className="mt-2 text-md text-[#6E675F]">
              {selectedRequest.employee_id ||
                selectedRequest.id ||
                "ID"}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-6">

            {/* APPROVE */}
            <button
              disabled={loading}
              onClick={handleApprove}
              className="w-full rounded-xl bg-green-800 py-5 text-lg font-semibold text-white shadow-lg hover:bg-green-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              Approve
            </button>

            {/* REJECT */}
            <button
              disabled={loading}
              onClick={handleReject}
              className="w-full rounded-xl border border-gray-300 bg-white py-5 text-lg font-semibold text-red-400 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveRequestStatus;
