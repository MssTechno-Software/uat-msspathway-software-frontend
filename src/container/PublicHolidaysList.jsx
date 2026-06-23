import { useEffect, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";

function PublicHolidayTable() {

    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "", // success | error | confirm
        onConfirm: null
    });

    /* FETCH HOLIDAYS */
    const fetchHolidays = async () => {
        const token = localStorage.getItem("token");

        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(
                "https://uat-msspathway-software-backend-81057313575.asia-south1.run.app/calendar/public-holidays/current-year",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch holidays");
            }
            const data = await response.json();
            console.log("Public Holidays:", data);
            setHolidays(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchHolidays();
    }, []);

    useEffect(() => {
        const refreshHolidays = () => {
            fetchHolidays();
        };

        window.addEventListener(
            "timesheetSubmitted",
            refreshHolidays
        );

        return () => {
            window.removeEventListener(
                "timesheetSubmitted",
                refreshHolidays
            );
        };

    }, []);

    /* DELETE HOLIDAY */
    const deleteHoliday = async (holidayId) => {

        const token = localStorage.getItem("token");

        try {

            const response = await fetch(
                `https://uat-msspathway-software-backend-81057313575.asia-south1.run.app/calendar/public-holidays/${holidayId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Delete failed");
            }

            /* REMOVE FROM UI */
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

            console.error(error);

            setPopup({
                show: true,
                type: "error",
                message: "Failed to delete holiday ❌",
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 w-full">
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

                                                    const holidayId =
                                                        holiday.holiday_id ||
                                                        holiday.id;
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
            {popup.show && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-xl shadow-lg text-center">
                        <h3
                            className={`text-lg font-semibold mb-2 ${popup.type === "error"
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
                                            popup.onConfirm();

                                            setPopup({
                                                show: false,
                                                message: "",
                                                type: "",
                                                onConfirm: null,
                                            });
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