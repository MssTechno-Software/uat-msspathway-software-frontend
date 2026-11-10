import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import api from "../api/axios";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "./ApiErrorModal";

function PublicHolidayTable() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "", // success | error | confirm
        onConfirm: null
    });

    /* FETCH HOLIDAYS */
    // Load the current year’s holidays and show a retry option if the request fails.
    const fetchHolidays = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/calendar/public-holidays/current-year"
            );

            setHolidays(response.data || []);
        } catch (error) {
            // A 401 means the session has expired, so let the app handle sign-out.
            // Keep expired-session handling consistent with the holiday fetch request.
            if (
                error?.response?.status === 401 ||
                error?.status === 401
            ) {
                setApiError(null);
                window.dispatchEvent(new Event("session-expired"));
                return;
            }

            setApiError({
                title: "Unable to Load Holidays",
                message: getApiErrorMessage(
                    error,
                    "Unable to load public holidays. Please try again."
                ),
                onRetry: fetchHolidays,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch holidays when the table first loads.
    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    // Refresh the table when another component adds or updates a public holiday.
    useEffect(() => {
        const refreshHolidays = () => {
            fetchHolidays();
        };

        window.addEventListener(
            "publicHolidayUpdated",
            refreshHolidays
        );

        return () => {
            window.removeEventListener(
                "publicHolidayUpdated",
                refreshHolidays
            );
        };
    }, [fetchHolidays]);

    /* DELETE HOLIDAY */
    // Delete the selected holiday, then update the table without another fetch.
    const deleteHoliday = async (holidayId) => {
        try {
            await api.delete(
                `/calendar/public-holidays/${holidayId}`
            );

            // Remove the deleted holiday from the displayed list.
            setHolidays((prev) =>
                prev.filter(
                    (item) =>
                        item.holiday_id !== holidayId &&
                        item.id !== holidayId
                )
            );

            setPopup({
                show: true,
                type: "success",
                message: "Holiday deleted successfully ✅",
            });
        } catch (error) {
            if (
                error?.response?.status === 401 ||
                error?.status === 401
            ) {
                setApiError(null);
                window.dispatchEvent(new Event("session-expired"));
                return;
            }

            setApiError({
                title: "Unable to Delete Holiday",
                message: getApiErrorMessage(
                    error,
                    "Failed to delete holiday. Please try again."
                ),
                onRetry: () => deleteHoliday(holidayId),
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 w-full">
            {/* Show API errors in a shared modal, including its retry action. */}
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

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Public Holidays
                </h2>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays
                        size={16}
                        className="text-green-700"
                    />
                    <span>
                        Holiday Calendar
                    </span>
                </div>
            </div>

            {/* TABLE */}
            {/* Show loading, empty, or holiday rows based on the current request state. */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full min-w-125">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-md">
                            <th className="text-left px-4 py-3">
                                S.No
                            </th>
                            <th className="text-left px-4 py-3">
                                Holiday Date
                            </th>
                            <th className="text-left px-4 py-3">
                                Description
                            </th>
                            <th className="text-center px-4 py-3">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-10 text-gray-400"
                                >
                                    Loading holidays...
                                </td>
                            </tr>
                        ) : holidays.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="text-center py-10 text-gray-400"
                                >
                                    No public holidays found
                                </td>
                            </tr>
                        ) : (
                            holidays.map((holiday, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        {holiday.holiday_date || holiday.date}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        {holiday.description}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => {
                                                    // Support both holiday ID fields returned by the API.
                                                    const holidayId =
                                                        holiday.holiday_id ||
                                                        holiday.id;

                                                    // Ask for confirmation before sending the delete request.
                                                    setPopup({
                                                        show: true,
                                                        type: "confirm",
                                                        message:
                                                            "Are you sure you want to delete this public holiday?",
                                                        onConfirm: () =>
                                                            deleteHoliday(holidayId),
                                                    });
                                                }}
                                                className="
                                                    p-2
                                                    transition
                                                    group
                                                "
                                            >
                                                <Trash2
                                                    size={18}
                                                    className="
                                                        text-gray-500
                                                        group-hover:text-red-600
                                                    "
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* POPUP */}
            {/* Reuse this popup for delete confirmation and success/error messages. */}
            {popup.show && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-xl shadow-lg text-center">
                        <h3
                            className={`text-lg font-semibold mb-2 ${
                                popup.type === "error"
                                    ? "text-red-600"
                                    : popup.type === "success"
                                        ? "text-green-600"
                                        : "text-gray-900"
                            }`}
                        >
                            {popup.type === "confirm"
                                ? "Delete Holiday"
                                : popup.type === "error"
                                    ? "Error"
                                    : "Success"}
                        </h3>

                        <p className="text-gray-600 text-sm">
                            {popup.message}
                        </p>

                        <div className="flex justify-center gap-4 mt-5">
                            {popup.type === "confirm" ? (
                                <>
                                    <button
                                        onClick={() =>
                                            setPopup({
                                                show: false,
                                                message: "",
                                                type: "",
                                                onConfirm: null,
                                            })
                                        }
                                        className="px-5 py-2 border border-gray-200 rounded-xl text-sm"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={() => {
                                            // Close the confirmation popup before running the saved action.
                                            const confirmAction = popup.onConfirm;

                                            setPopup({
                                                show: false,
                                                message: "",
                                                type: "",
                                                onConfirm: null,
                                            });

                                            confirmAction?.();
                                        }}
                                        className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm"
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() =>
                                        setPopup({
                                            show: false,
                                            message: "",
                                            type: "",
                                            onConfirm: null,
                                        })
                                    }
                                    className="px-6 py-2 bg-green-800 text-white rounded-xl hover:bg-green-700 text-sm"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PublicHolidayTable;
