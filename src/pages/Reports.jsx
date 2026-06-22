import { useState, useEffect } from "react";
import AddReports from "./AddReports";
import CompanyCard from "../container/CompanyCard";
import { FiSearch, FiLoader, FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";
import axios from "axios";

const STAGES = ["Call", "Mail", "Assignment", "L1", "L2", "Offer"];

const normalizeStage = (stage) => {
    const value = stage?.toLowerCase().trim();

    if (value.includes("call")) return "Call";
    if (value.includes("mail")) return "Mail";
    if (value.includes("assignment")) return "Assignment";
    if (value.includes("l1")) return "L1";
    if (value.includes("l2")) return "L2";
    if (value.includes("offer")) return "Offer";

    return "Call";
};

const normalizeStatus = (status) => {
    const value = status?.toLowerCase().trim();

    if (value === "completed" || value === "cleared") return "Cleared";
    if (value === "pending") return "Pending";
    if (value === "rejected") return "Rejected";
    if (value === "skipped") return "Skipped";

    return "Pending";
};

const API = axios.create({
    baseURL: "https://timesheet-api-790373899641.asia-south1.run.app",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function Reports() {
    const [entries, setEntries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [editData, setEditData] = useState(null);
    const { client_id } = useParams();
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [appliedFromDate, setAppliedFromDate] = useState("");
    const [appliedToDate, setAppliedToDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [counts, setCounts] = useState({
        "Call Received": 0,
        "Mail Received": 0,
        "Assignment": 0,
        "L1 Interview": 0,
        "L2 Interview": 0,
        "Offer Letter": 0,
    });
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "",
        onConfirm: null
    });

    const itemsPerPage = 6;

    // FETCH REPORTS
    const fetchReports = async () => {
        try {
            setLoading(true);

            const res = await API.get(`/reports/clients/${client_id}/reports`);

            console.log("Fetched reports:", res.data);

            const responseData = res.data || {};

            // PIPELINE OVERVIEW COUNTS
            setCounts({
                "Call Received": responseData.pipeline_overview?.calls_received || 0,
                "Mail Received": responseData.pipeline_overview?.mails_received || 0,
                "L1 Interview": responseData.pipeline_overview?.l1_interviews || 0,
                "L2 Interview": responseData.pipeline_overview?.l2_interviews || 0,
                "Offer Letter": responseData.pipeline_overview?.offer_letters || 0,
            });

            // COMPANY PROGRESSION
            const data = responseData.company_progression || [];

            const formatted = data.map((item) => ({
                company: item.company,
                created_date: item.created_date,
                stages: (item.stages || []).map((stageItem) => ({
                    id: item.report_id,
                    stage: normalizeStage(stageItem.stage),
                    status: normalizeStatus(stageItem.status),
                    date: stageItem.date,
                })),
            }));

            setEntries(formatted);

        } catch (err) {

            console.error(
                "ERROR:",
                err.response?.data || err.message
            );

            setPopup({
                show: true,
                message:
                    err.response?.data?.message ||
                    "Failed to fetch reports",
                type: "error"
            });

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (client_id) fetchReports();
    }, [client_id]);

    const handleSave = async (newEntry) => {
        const isUpdating = editData?.id !== null && editData?.id !== undefined;
        const payload = {
            client_id: client_id,
            company_name: newEntry.company,
            recruiter_name: newEntry.recruiterName,
            recruiter_contact: newEntry.recruiterContact,
            recruiter_email: newEntry.recruiterEmail,
            type: newEntry.stage,
            status: newEntry.status,
            date: newEntry.date,
            notes: newEntry.notes
        };

        console.log("Payload to save:", payload);
        try {
            setLoading(true);
            if (isUpdating) {
                // UPDATE
                console.log("Updating report with ID:", editData.id);
                const response = await API.put(`/reports/reports/${editData.id}`, payload);
                console.log("Update report response:", response.data);
            } else {
                // CREATE
                console.log("client_id for creating report:", client_id);
                const response = await API.post(`/reports/clients/${client_id}/reports`, payload);
                console.log("Created report response:", response.data);
            }
            setPopup({
                show: true,
                message: isUpdating ? "Report updated successfully." : "Report added successfully.",
                type: "success"
            });
            // REFRESH
            fetchReports();
            console.log("Reports refreshed after save.");

            setEditData(null);
            setShowModal(false);

        } catch (err) {
            console.error("ERROR:", err.response?.data || err.message);
            setPopup({
                show: true,
                message: "Failed to save report. Please try again.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (companyName) => {

        console.log(
            "Attempting to delete company:",
            companyName
        );

        if (!companyName) {
            setPopup({
                show: true,
                message: "Invalid company name.",
                type: "error"
            });
            return;
        }

        setPopup({
            show: true,
            message: "Are you sure you want to delete this company report?",
            type: "confirm",

            onConfirm: async () => {

                try {
                    setLoading(true);
                    // GET LATEST REPORTS
                    const res = await API.get(
                        `/reports/clients/${client_id}/reports`
                    );
                    const companies =
                        res.data?.company_progression || [];

                    // GET ALL REPORT IDS OF SAME COMPANY
                    const reportIds = companies
                        .filter((item) => item.company === companyName)
                        .map((item) => item.report_id)
                        .filter(Boolean);

                    console.log(
                        "Deleting report IDs:",
                        reportIds
                    );
                    // REMOVE COMPANY FROM UI FIRST
                    setEntries((prev) =>
                        prev.filter(
                            (item) => item.company !== companyName
                        )
                    );

                    // DELETE ALL REPORTS IN BACKEND
                    await Promise.all(
                        reportIds.map((report_id) =>
                            API.delete(`/reports/reports/${report_id}`)
                        )
                    );

                    // REFRESH FINAL DATA
                    await fetchReports();
                    setPopup({
                        show: true,
                        message: "Company deleted successfully.",
                        type: "success"
                    });
                } catch (err) {
                    console.error(
                        "DELETE ERROR:",
                        err.response?.data || err.message
                    );
                    setPopup({
                        show: true,
                        message: "Failed to delete company.",
                        type: "error"
                    });
                } finally {
                    setLoading(false);

                }
            }
        });
    };
    const handleEdit = async (company) => {
        try {
            const latest = [...company.stages]
                .filter((stage) => stage.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            if (!latest?.id) {
                setPopup({
                    show: true,
                    message: "No report found for editing.",
                    type: "error",
                });
                return;
            }

            // fetch full report details
            const res = await API.get(`/reports/reports/${latest.id}`);
            const report = res.data;

            console.log("Edit report ID:", report.id);

            setEditData({
                id: report.id,
                company: report.company_name || "",
                recruiterName: report.recruiter_name || "",
                recruiterContact: report.recruiter_contact || "",
                recruiterEmail: report.recruiter_email || "",
                stage: normalizeStage(report.type),
                status: normalizeStatus(report.status),
                date: report.date || "",
                notes: report.notes || "",
            });

            setShowModal(true);

        } catch (err) {
            console.error("EDIT FETCH ERROR:", err.response?.data || err.message);
            setPopup({
                show: true,
                message: "Failed to load report details.",
                type: "error",
            });
        }
    };

    // Group by company
    const grouped = Object.values(
        entries.reduce((acc, entry) => {
            if (!acc[entry.company]) {
                acc[entry.company] = {
                    company: entry.company,
                    created_date: entry.created_date,
                    stages: [],
                };
            }
            // push actual stage objects
            acc[entry.company].stages.push(...entry.stages);

            // sort stages properly
            acc[entry.company].stages.sort(
                (a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)
            );

            return acc;
        }, {})
    );

    //filter
    const parseLocalDate = (dateValue, endOfDay = false) => {
        if (!dateValue) return null;
        // ALREADY A DATE OBJECT
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

        // DD-MM-YYYY
        else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {

            [day, month, year] =
                dateStr.split("-").map(Number);
        }

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
    // DATE FILTER ONLY (FOR COUNTS)
    const dateFiltered = grouped.filter((company) => {

        // Use created_date instead of latest stage date
        const reportDate = parseLocalDate(
            company.created_date
        );

        if (!reportDate) {
            return false;
        }

        const from = appliedFromDate
            ? parseLocalDate(appliedFromDate)
            : null;

        const to = appliedToDate
            ? parseLocalDate(appliedToDate, true)
            : null;

        if (from && to) {
            return (
                reportDate.getTime() >= from.getTime() &&
                reportDate.getTime() <= to.getTime()
            );
        }

        if (from) {
            return reportDate.getTime() >= from.getTime();
        }

        if (to) {
            return reportDate.getTime() <= to.getTime();
        }

        return true;
    });

    // SEARCH + DATE FILTER (FOR COMPANY CARDS)
    const filtered = dateFiltered.filter((company) => {

        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
            !searchValue ||
            company.company?.toLowerCase().includes(searchValue);

        return matchesSearch;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
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
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6">

                {/* TOP HEADER */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-3xl font-bold mb-1">Reports</h2>
                        <p className="text-gray-500">
                            Comprehensive overview of pipeline progression across all active companies.
                        </p>

                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">

                        {/* SEARCH BAR */}
                        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full shadow-sm w-full sm:w-64">
                            <FiSearch className="text-gray-400 mr-2" />
                            <input
                                placeholder="Search companies..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="outline-none"
                            />
                            {/* Clear Button */}
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="ml-2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                >
                                    <FiX size={18} />
                                </button>
                            )}
                        </div>

                        {/* ADD BUTTON */}
                        <button
                            onClick={() => {
                                setEditData(null);
                                setShowModal(true);
                            }}
                            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow cursor-pointer"
                        >
                            Add Report
                        </button>

                    </div>
                </div>

                {/* PIPELINE OVERVIEW */}
                <div className="mb-6">
                    {/* HEADER + FILTER IN SAME ROW */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5 w-full">

                        {/* LEFT TITLE */}
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-green-700">📊</span> Pipeline Overview
                        </h3>

                        {/* RIGHT FILTER */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 lg:w-auto">

                            {/* FROM */}
                            <div className="flex items-center gap-2 sm:pr-5 sm:border-r w-full sm:w-auto">
                                <span className="text-sm font-semibold text-gray-400 uppercase whitespace-nowrap">
                                    From
                                </span>

                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="text-sm text-gray-600 outline-none bg-transparent cursor-pointer w-full sm:w-auto"
                                />
                            </div>

                            {/* TO */}
                            <div className="flex items-center gap-2 sm:px-5 sm:border-r border-gray-200 w-full sm:w-auto">
                                <span className="text-sm font-semibold text-gray-400 uppercase whitespace-nowrap">
                                    To
                                </span>

                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="text-sm text-gray-600 outline-none bg-transparent cursor-pointer w-full sm:w-auto"
                                />
                            </div>

                            {/* BUTTONS */}
                            <div className="sm:pl-5 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">

                                <button
                                    onClick={() => {
                                        setAppliedFromDate(fromDate);
                                        setAppliedToDate(toDate);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-green-800 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition w-full sm:w-auto cursor-pointer"
                                >
                                    Search
                                </button>

                                <button
                                    onClick={() => {
                                        setFromDate("");
                                        setToDate("");
                                        setAppliedFromDate("");
                                        setAppliedToDate("");
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-200 rounded-xl font-medium text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition px-5 py-2 cursor-pointer w-full sm:w-auto"
                                >
                                    Clear
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {Object.entries(counts).map(([key, val]) => (
                            <div
                                key={key}
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"
                            >
                                <p className="text-gray-500 text-sm">{key}</p>
                                <h2 className="text-2xl font-bold">{val}</h2>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COMPANY STATUS HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">Company Status Progression</h3>

                    <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Cleared
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Pending
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span> Rejected
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span> Skipped
                        </span>
                    </div>
                </div>

                {/* COMPANY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginated.map((company, idx) => (
                        <CompanyCard
                            key={company.company}
                            data={company}
                            onDelete={() => {
                                handleDelete(company.company);
                            }}
                            onEdit={() => handleEdit(company)}
                        />

                    ))}
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">

                    <p className="text-gray-500 text-sm">
                        {filtered.length === 0
                            ? "No data available"
                            : `Showing ${paginated.length} of ${filtered.length} reports`}
                    </p>

                    <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-end text-xs sm:text-sm">

                        {/* FIRST PAGE */}
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border
                                ${currentPage === 1
                                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                        >
                            {"<<"}
                        </button>

                        {/* PREVIOUS */}
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border
                                ${currentPage === 1
                                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                        >
                            Previous
                        </button>

                        {/* PAGE NUMBERS */}
                        {filtered.length > 0 &&
                            Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded border
                                        ${currentPage === page
                                            ? "bg-green-800 text-white border-green-800"
                                            : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                        {/* NEXT */}
                        <button
                            onClick={() =>
                                setCurrentPage(p => Math.min(p + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border
                                ${currentPage === totalPages
                                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                        >
                            Next
                        </button>

                        {/* LAST PAGE */}
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border
                                ${currentPage === totalPages
                                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                        >
                            {">>"}
                        </button>
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <AddReports
                        onClose={() => setShowModal(false)}
                        onSave={handleSave}
                        editData={editData}
                        setPopup={setPopup}
                    />
                )}

                {popup.show && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-2">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">

                            <p className={`mb-4 font-semibold
                    ${popup.type === "success" && "text-green-600"}
                    ${popup.type === "error" && "text-red-600"}
                    ${popup.type === "confirm" && "text-gray-800"}
                `}>
                                {popup.message}
                            </p>

                            <div className="flex justify-center gap-3">
                                {popup.type === "confirm" ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                popup.onConfirm();
                                                setPopup({ show: false });
                                            }}
                                            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                                        >
                                            Yes
                                        </button>

                                        <button
                                            onClick={() => setPopup({ show: false })}
                                            className="bg-gray-300 px-4 py-2 rounded border border-gray-200 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setPopup({ show: false })}
                                        className="bg-green-800 text-white px-4 py-2 rounded cursor-pointer"
                                    >
                                        OK
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}