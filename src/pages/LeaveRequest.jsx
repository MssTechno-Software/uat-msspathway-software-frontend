import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { FiLoader } from "react-icons/fi"
import axios from "axios";
import LeaveRequestStatus from "../container/LeaveRequestStatus";

const API = axios.create({
  baseURL: "https://timesheet-api-790373899641.asia-south1.run.app",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [tempStartFilter, setTempStartFilter] = useState("");
  const [tempEndFilter, setTempEndFilter] = useState("");
  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    message: "",
    leaveId: null,
  });

  const showPopup = (message, type = "success", leaveId = null) => {
    setPopup({
      show: true,
      type,
      message,
      leaveId,
    });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      message: "",
      leaveId: null,
    });
  };

  // FETCH LEAVE REQUESTS
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await API.get("/timesheet/admin/leave-requests");
      console.log("Leave Requests:", response.data);
      setRequests(
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || []
      );
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE LEAVE STATUS
  const handleApprove = async (request) => {
    try {
      setLoading(true);
      console.log("REQUEST:", request);
      const leave_id = request?.leave_id;
      const response = await API.put(`/timesheet/leave-status/${leave_id}`,
        {
          status: "approved",
        }
      );
      console.log("Approve Response:", response.data);
      showPopup("Leave approved successfully", "success");
      setOpenModal(false);
      fetchLeaveRequests();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to approve leave";
      showPopup(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (request) => {
    try {
      setLoading(true);
      console.log("REQUEST:", request);
      const leave_id = request?.leave_id;
      const response = await API.put(`/timesheet/leave-status/${leave_id}`,
        {
          status: "rejected",
        }
      );
      console.log("Reject Response:", response.data);
      showPopup("Leave rejected successfully", "success");
      setOpenModal(false);
      fetchLeaveRequests();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to reject leave";
      showPopup(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // DELETE LEAVE REQUEST
  const deleteLeaveRequest = async (leaveId) => {
    console.log("Deleting Leave Request ID:", leaveId);
    try {
      setLoading(true);
      const response = await API.delete(`/timesheet/leave/${leaveId}`);
      console.log("Delete Response:", response.data);

      showPopup("Leave request deleted successfully", "success");

      fetchLeaveRequests();
    } catch (error) {
      console.error("Error deleting leave request:", error);
      showPopup("Failed to delete leave request", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    const handleRefresh = () => fetchLeaveRequests();
    window.addEventListener("leaveRequestUpdated", handleRefresh);
    return () => {
      window.removeEventListener(
        "leaveRequestUpdated",
        handleRefresh
      );
    };
  }, []);

  // HELPERS
  const formatDate = (date) => {
    if (!date) return "-";
    const safeDate = parseLocalDate(date);
    return safeDate?.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  const calculateDays = (start, end) => {

    if (!start || !end) return "1 Day";

    const startDate = parseLocalDate(start);

    const endDate = parseLocalDate(end);

    const diff =
      endDate.getTime() - startDate.getTime();

    return `${Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1} Days`;
  };

  const getStatusColor = (status) => {
    const value = status?.toLowerCase();

    if (value === "approved") {
      return "bg-green-100 text-green-700 border border-green-200";
    }

    if (value === "rejected") {
      return "bg-red-100 text-red-700 border border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  };

  // FILTER REQUESTS BY DATE
  const parseLocalDate = (dateValue, endOfDay = false) => {
    if (!dateValue) return null;
    // ALREADY DATE OBJECT
    if (dateValue instanceof Date) {
      return dateValue;
    }
    // HANDLE STRING
    let dateStr = String(dateValue).trim();
    // REMOVE TIME PART
    if (dateStr.includes("T")) {
      dateStr = dateStr.split("T")[0];
    }
    let year, month, day;
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      [year, month, day] =
        dateStr.split("-").map(Number);
    }

    // // DD-MM-YYYY
    // else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    //   [day, month, year] =
    //     dateStr.split("-").map(Number);
    // }

    // OTHER FORMATS
    else {
      const tempDate = new Date(dateStr);
      if (isNaN(tempDate.getTime())) {
        return null;
      }
      year = tempDate.getFullYear();
      month = tempDate.getMonth() + 1;
      day = tempDate.getDate();
    }

    return new Date(
      year,
      month - 1,
      day,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0
    );
  };

  const filteredRequests = requests.filter((item) => {

    let matchesDate = true;

    // SAFE REQUEST DATE
    const requestDate =
      parseLocalDate(item.start_date);

    // INVALID DATE
    if (!requestDate) {
      matchesDate = false;
    }

    // FROM DATE
    const from = startFilter
      ? parseLocalDate(startFilter)
      : null;

    // TO DATE
    const to = endFilter
      ? parseLocalDate(endFilter, true)
      : null;

    // BOTH FROM & TO
    if (from && to && requestDate) {

      matchesDate =
        requestDate.getTime() >= from.getTime() &&
        requestDate.getTime() <= to.getTime();
    }

    // ONLY FROM
    else if (from && requestDate) {

      matchesDate =
        requestDate.getTime() >= from.getTime();
    }

    // ONLY TO
    else if (to && requestDate) {

      matchesDate =
        requestDate.getTime() <= to.getTime();
    }

    return matchesDate;
  });

  const handleSearchFilter = () => {
    setStartFilter(tempStartFilter);
    setEndFilter(tempEndFilter);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setTempStartFilter("");
    setTempEndFilter("");
    setStartFilter("");
    setEndFilter("");
    setCurrentPage(1);
  };

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIndex =
    filteredRequests.length === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const endIndex = Math.min(
    currentPage * itemsPerPage,
    filteredRequests.length
  );

  return (
    <>
      {(loading || pageLoading) && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">

          <div className="p-6 flex flex-col items-center gap-3">

            <FiLoader className="animate-spin text-4xl text-green-800" />

            <p className="text-gray-800 font-medium">
              Please wait...
            </p>

          </div>
        </div>
      )}
      <div className="min-h-screen bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-black">
              Leave Requests
            </h1>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full xl:w-auto">
              {/* From Date */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white w-full sm:w-auto">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  From
                </span>
                <input
                  type="date"
                  value={tempStartFilter}
                  onChange={(e) => setTempStartFilter(e.target.value)}
                  className="outline-none text-sm w-full sm:w-auto"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white w-full sm:w-auto">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  To
                </span>
                <input
                  type="date"
                  value={tempEndFilter}
                  onChange={(e) => setTempEndFilter(e.target.value)}
                  className="outline-none text-sm w-full sm:w-auto"
                />
              </div>

              {/* Search Button */}
              <button
                disabled={loading}
                onClick={handleSearchFilter}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-green-800 text-white font-medium hover:bg-green-700 cursor-pointer transition"
              >
                Search
              </button>

              {/* Clear Button */}
              <button
                disabled={loading}
                onClick={handleClearFilter}
                className="w-full sm:w-auto px-5 py-2 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/*Table*/}
          <div className="overflow-x-auto w-full">
            <div className="min-w-275 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-8 px-4 md:px-8 py-6 bg-gray-100 text-sm md:text-md tracking-widest text-black font-semibold uppercase">
                <div className="col-span-2">Employee</div>
                <div>Leave Type</div>
                <div>Start Date</div>
                <div>End Date</div>
                <div>Duration</div>
                <div>Status</div>
                <div className="text-center">Actions</div>
              </div>

              {/* Body */}
              {loading ? (
                <div className="py-10 text-center text-gray-500">
                  Loading leave requests...
                </div>
              ) : filteredRequests.length > 0 ? (
                paginatedRequests.map((item) => (
                  <div
                    key={item.leave_id}
                    className="grid grid-cols-8 items-center text-sm px-4 md:px-8 py-4 border-t border-gray-200 hover:bg-[#faf8f6] transition"
                  >
                    {/* Employee */}
                    <div className="col-span-2 flex items-center gap-4">
                      <div>
                        <div className="break-word">
                          {item.employee_name || "-"}
                        </div>

                        <div className="mt-1">
                          Employee ID: {item.employee_id || "-"}
                        </div>
                      </div>
                    </div>

                    {/* Leave Type */}
                    <div>
                      {item.leave_type === "one_day"
                        ? "One Day"
                        : "Multiple Days "}
                    </div>

                    {/* Dates */}
                    <div>{formatDate(item.start_date)}</div>
                    <div>{formatDate(item.end_date)}</div>

                    {/* Duration */}
                    <div>
                      {item.leave_type === "one_day"
                        ? "1 Day"
                        : calculateDays(
                          item.start_date,
                          item.end_date
                        )}
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status || "Pending"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-4">
                      {/* Approve */}
                      <button
                        onClick={() => {
                          setSelectedRequest(item);
                          setOpenModal(true);
                        }}
                        className="hover:scale-110 transition"
                      >
                        <Pencil
                          size={18}
                          className="text-gray-400 hover:text-green-500"
                        />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          showPopup(
                            "Are you sure you want to delete this leave request?",
                            "delete",
                            item.leave_id
                          )
                        }
                        className="hover:scale-110 transition"
                      >
                        <Trash2
                          size={18}
                          className="text-gray-400 hover:text-red-500"
                        />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-gray-500">
                  No leave requests found.
                </div>
              )}

              {filteredRequests.length > 0 && (
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 border-t border-gray-200 bg-gray-50">

                  {/* Showing entries */}
                  <p className="text-sm text-gray-500">
                    Showing {startIndex} to {endIndex} of {filteredRequests.length} entries
                  </p>

                  {/* Pagination */}
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-3 md:mt-0">

                    {/* FIRST PAGE */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 text-sm rounded-lg border
                        ${currentPage === 1
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {"<<"}
                    </button>

                    {/* PREVIOUS */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-4 py-2 text-sm rounded-lg border
                        ${currentPage === 1
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      Previous
                    </button>

                    {/* PAGE NUMBERS */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg border text-sm font-semibold
                          ${currentPage === page
                            ? "bg-[#0F5B33] text-white border-[#0F5B33]"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* NEXT */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 text-sm rounded-lg border
                        ${currentPage === totalPages
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      Next
                    </button>

                    {/* LAST PAGE */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 text-sm rounded-lg border
                        ${currentPage === totalPages
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {">>"}
                    </button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <LeaveRequestStatus
          open={openModal}
          onClose={() => setOpenModal(false)}
          selectedRequest={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {popup.show && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
              <div className="p-8 text-center">
                <h2
                  className={`text-xl font-bold mb-4 ${popup.type === "error"
                    ? "text-red-600"
                    : popup.type === "delete"
                      ? "text-[#A84242]"
                      : "text-[#0F5B33]"
                    }`}
                >
                  {popup.type === "error"
                    ? "Error"
                    : popup.type === "delete"
                      ? "Confirm Delete"
                      : "Success"}
                </h2>

                {/* Popup Message */}
                <p className="text-gray-600 text-md">{popup.message}</p>

                <div className="mt-8 flex justify-center gap-4">
                  {popup.type === "delete" ? (
                    <>
                      <button
                        onClick={closePopup}
                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => {
                          deleteLeaveRequest(popup.leaveId);
                          closePopup();
                        }}
                        className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={closePopup}
                      className="px-8 py-3 rounded-xl bg-[#0F5B33] text-white hover:bg-[#0C4A29]"
                    >
                      OK
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default LeaveRequests;