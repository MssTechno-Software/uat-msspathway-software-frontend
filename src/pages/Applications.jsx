import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiEdit, FiTrash2, FiSearch, FiX, FiLoader } from "react-icons/fi";
import axios from "axios";
import AddApplication from "./AddApplication";

const API = axios.create({
    baseURL: "https://timesheet-api-790373899641.asia-south1.run.app",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function Applications() {
    const { client_id } = useParams();
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [appliedFromDate, setAppliedFromDate] = useState("");
    const [appliedToDate, setAppliedToDate] = useState("");
    const [clientName, setClientName] = useState("");
    const [previousCounts, setPreviousCounts] = useState({});
    const [pageMap, setPageMap] = useState({});
    const ITEMS_PER_PAGE = 5;
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [popup, setPopup] = useState(
        {
            show: false,
            message: "",
            type: ""
        }
    );

    const platforms = [
        "All",
        "Naukri",
        "LinkedIn",
        "Career Pages",
        "Cold Emails",
        "Other",
    ];

    // FETCH
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/applications/applications/${client_id}`);
                console.log("Fetched applications:", res.data);

                const appsObject = res.data?.applications || {};

                // convert object → array + add platform
                const allApplications = Object.entries(appsObject).flatMap(([platform, apps]) =>
                    apps.map(app => ({ ...app, platform }))
                );

                const formatted = allApplications
                    .map((app) => ({
                        id: app.id,
                        platform: app.platform,
                        company: app.company_name,
                        role: app.role,
                        date: app.date,
                        link: app.application_link,
                        notes: app.notes,
                        created_at: app.created_at,
                        updated_at: app.updated_at
                    }))
                    .sort((a, b) => {

                        // latest updated first
                        const dateA = new Date(
                            a.updated_at || a.created_at
                        );

                        const dateB = new Date(
                            b.updated_at || b.created_at
                        );

                        return dateB - dateA;
                    });

                setApplications(formatted);
            } catch (err) {
                console.error("ERROR:", err.response?.data || err.message);
                setPopup({
                    show: true,
                    message: err.response?.data?.message || "Failed to fetch applications",
                    type: "error"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [client_id]);

    //add and update applications
    const addApplication = async (app) => {
        try {
            setLoading(true);
            const isEdit = !!editingApp;
            // Required only while adding
            if (
                !isEdit &&
                (!app.platform || !app.company || !app.role || !app.date || !app.link)
            ) {
                setPopup({
                    show: true,
                    message: "Please fill in all required fields",
                    type: "error"
                });

                setLoading(false);
                return;
            }

            const payload = {
                platform: app.platform,
                company_name: app.company,
                role: app.role,
                date_applied: app.date,
                application_link: app.link,
                notes: app.notes || ""
            };

            console.log("Application with payload:", payload);
            console.log("Client ID:", client_id);

            if (editingApp) {
                // UPDATE
                const application_id = editingApp.id;
                const response = await API.put(`/applications/update/${application_id}`, payload);

                console.log("updated applications:", response.data);
                setLoading(false);
                setPopup({
                    show: true,
                    message: "Application updated successfully",
                    type: "success"
                });

            } else {
                // CREATE
                const response = await API.post(`/applications/create_application/${client_id}`, payload);
                console.log("Added Apllication:", response.data);
                setLoading(false);
                setPopup({
                    show: true,
                    message: "Application added successfully",
                    type: "success"
                });
            }

            //refresh
            const res = await API.get(`/applications/applications/${client_id}`);
            console.log("Feached applications after save:", res.data)
            const appsObject = res.data?.applications || {};

            const allApplications = Object.entries(appsObject).flatMap(([platform, apps]) =>
                apps.map(app => ({ ...app, platform }))
            );

            const formatted = allApplications.map((app) => ({
                id: app.id,
                platform: app.platform,
                company: app.company_name,
                role: app.role,
                date: app.date,
                link: app.application_link,
                notes: app.notes
            }));

            setApplications(formatted);
            setShowModal(false);
            setEditingApp(null);
        } catch (err) {
            console.error(err.response?.data || err.message);
            setLoading(false);
            setPopup({
                show: true,
                message: "Failed to save application",
                type: "error"
            });
        }
    };

    //Delete Client
    const handleDelete = (application_id) => {
        setPopup({
            show: true,
            message: "Are you sure you want to delete this application?",
            type: "confirm",
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const response = await API.delete(`/applications/delete/${application_id}`);
                    console.log("Deleted application:", response.data);

                    // refresh applications
                    const res = await API.get(`/applications/applications/${client_id}`);
                    console.log("Fetched applications after deletion:", res.data);

                    const appsObject = res.data?.applications || {};

                    const allApplications = Object.entries(appsObject).flatMap(([platform, apps]) =>
                        apps.map(app => ({ ...app, platform }))
                    );

                    const formatted = allApplications.map((app) => ({
                        id: app.id,
                        platform: app.platform,
                        company: app.company_name,
                        role: app.role,
                        date: app.date,
                        link: app.application_link,
                        notes: app.notes
                    }));

                    setApplications(formatted);
                    setPopup({
                        show: true,
                        message: "Application deleted successfully",
                        type: "success"
                    });

                } catch (err) {
                    console.error(err.response?.data || err.message);

                    setPopup({
                        show: true,
                        message: "Failed to delete application",
                        type: "error"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleEdit = async (application_id) => {
        try {
            console.log("Editing application id:", application_id);
            const res = await API.get(`/applications/applcations/application_id`, {
                params: { application_id: application_id }
            });
            console.log("Edit API response:", res.data);
            const data = res.data;
            setEditingApp({
                id: data.id,
                platform: data.platform,
                company: data.company_name,
                role: data.role,
                date: data.date_applied || data.date,
                link: data.application_link,
                notes: data.notes || ""
            });

            setShowModal(true);

        } catch (err) {
            console.error("Edit API error:", err.response?.data || err.message);
        }
    };
    useEffect(() => {
        const prev = JSON.parse(localStorage.getItem(`prev_counts_${client_id}`)) || {};
        setPreviousCounts(prev);
    }, [client_id]);
    //get the percentage
    const getPercentage = (count, total) => {
        if (total === 0) return 0;

        return Math.round((count / total) * 100);
    };

    // FILTER
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
        // OTHER DATE FORMATS
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

    // FILTER FOR CARDS (ONLY DATE FILTER)
    const cardFilteredApps = applications.filter((app) => {

        let matchesDate = true;

        const appDate = parseLocalDate(app.date);

        if (!appDate) {
            matchesDate = false;
        }

        const from = appliedFromDate
            ? parseLocalDate(appliedFromDate)
            : null;

        const to = appliedToDate
            ? parseLocalDate(appliedToDate, true)
            : null;

        if (from && to && appDate) {
            matchesDate =
                appDate.getTime() >= from.getTime() &&
                appDate.getTime() <= to.getTime();
        }

        else if (from && appDate) {
            matchesDate =
                appDate.getTime() >= from.getTime();
        }

        else if (to && appDate) {
            matchesDate =
                appDate.getTime() <= to.getTime();
        }

        return matchesDate;
    });

    // FILTER FOR TABLE (SEARCH + TAB + DATE)
    const filteredApps = cardFilteredApps.filter((app) => {

        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
            !searchValue ||
            app.company?.toLowerCase().includes(searchValue) ||
            app.role?.toLowerCase().includes(searchValue) ||
            app.platform?.toLowerCase().includes(searchValue);

        const matchesTab =
            activeTab === "All" ||
            app.platform?.toLowerCase() === activeTab.toLowerCase();

        return matchesSearch && matchesTab;
    });

    //count
    const currentCounts = platforms.reduce((acc, platform) => {

        if (platform === "All") {
            acc[platform] = cardFilteredApps.length;
        } else {
            acc[platform] = cardFilteredApps.filter(
                (a) => a.platform === platform
            ).length;
        }

        return acc;

    }, {});

    const currentPage = pageMap[activeTab] || 1;

    const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);

    const paginatedApps = filteredApps.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
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

            <div className="bg-gray-50 w-full px-4 sm:px-6 lg:px-8 py-4">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold">
                        Applications
                    </h1>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* SEARCH */}
                        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full shadow-sm">
                            <div className="relative w-full sm:w-64">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    placeholder="Search applications..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPageMap({
                                            ...pageMap,
                                            [activeTab]: 1,
                                        });
                                    }}
                                    className="pl-11 pr-10 rounded-full outline-none placeholder-gray-400"
                                />
                                {/*clear search*/}
                                {search && (
                                    <FiX
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    />
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full sm:w-auto bg-green-800 text-white px-4 py-2 rounded-xl hover:bg-green-700 cursor-pointer"
                        >
                            Add Application
                        </button>
                    </div>
                </div>

                {/* CARDS */}
                <div className="grid grid-cols-1 shadow-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 bg-gray-100 p-6 rounded-2xl">

                    {platforms.map((item) => {
                        const current = currentCounts[item] || 0;
                        const totalApplications = cardFilteredApps.length;
                        const percent = getPercentage(current, totalApplications);
                        return (
                            <div key={item} className="bg-white p-5 rounded-2xl hover:shadow-md transition-all">
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-500 text-sm">{item}</p>
                                    <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-600">
                                        {percent}%
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold mt-3">
                                    {current}
                                </h2>

                                <div className="mt-3">
                                    <div className="h-10 flex items-end gap-1">
                                        {[4, 6, 5, 8, 7].map((h, i) => (
                                            <div
                                                key={i}
                                                className="w-2 rounded bg-green-300"
                                                style={{ height: `${h * 4}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filter */}
                <div className="flex flex-col lg:flex-row lg:justify-end lg:items-center gap-3 w-full mt-2">

                    {/* From Date */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                            From
                        </span>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="outline-none text-sm"
                        />
                    </div>

                    {/* To Date */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                            To
                        </span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="outline-none text-sm"
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => {
                                setAppliedFromDate(fromDate);
                                setAppliedToDate(toDate);
                                setLoading(false);
                            }, 500);
                        }}
                        className="px-5 py-2 rounded-xl bg-green-800 text-white font-medium hover:bg-green-700 transition cursor-pointer"
                    >
                        Search
                    </button>

                    {/* Clear Button */}
                    <button
                        onClick={() => {
                            setLoading(true);

                            setTimeout(() => {
                                setFromDate("");
                                setToDate("");
                                setAppliedFromDate("");
                                setAppliedToDate("");
                                setSearch("");
                                setActiveTab("All");
                                setPageMap({
                                    All: 1,
                                });
                                setLoading(false);
                            }, 500);
                        }}
                        className="px-5 py-2 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    >
                        Clear
                    </button>
                </div>

                {/* TABS */}
                <div className="flex gap-6 border-b mb-4 overflow-x-auto">

                    {["All", "Naukri", "LinkedIn", "Career Pages", "Cold Emails", "Other"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 ${activeTab === tab
                                ? "border-b-2 border-green-600 text-green-600"
                                : "text-gray-500"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-4 text-left">WEBSITE NAME</th>
                                    <th className="p-4 text-left">DATE</th>
                                    <th className="p-4 text-left">ROLE</th>
                                    <th className="p-4 text-left">COMPANY</th>
                                    <th className="p-4 text-left">LINK</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredApps.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-400">
                                            No applications found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium">{app.platform}</td>
                                            <td className="p-4">{app.date}</td>
                                            <td className="p-4">{app.role}</td>
                                            <td className="p-4">{app.company}</td>
                                            <td className="p-4">
                                                <a
                                                    href={app.link}
                                                    target="_blank"
                                                    className="text-green-700 font-medium cursor-pointer hover:underline"
                                                >
                                                    View ↗
                                                </a>
                                            </td>
                                            <td className="p-4 flex gap-3 text-gray-500">
                                                {/* EDIT */}
                                                <FiEdit
                                                    size={18}
                                                    className="cursor-pointer hover:text-green-600"
                                                    onClick={() => {
                                                        handleEdit(app.id);
                                                        //setShowModal(true);
                                                    }}
                                                />

                                                {/* DELETE */}
                                                <FiTrash2
                                                    size={18}
                                                    className="cursor-pointer hover:text-red-500"
                                                    onClick={() => handleDelete(app.id)}
                                                />

                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 gap-3">

                            {/* LEFT */}
                            <div className="text-sm text-gray-500">
                                Showing {paginatedApps.length} of {filteredApps.length} applications
                            </div>

                            {/* RIGHT */}
                            <div className="flex items-center gap-2 flex-wrap">

                                {/* START */}
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => {
                                        setPageLoading(true);

                                        setTimeout(() => {
                                            setPageMap({
                                                ...pageMap,
                                                [activeTab]: 1,
                                            });

                                            setPageLoading(false);
                                        }, 400);
                                    }}
                                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer"
                                >
                                    {"<<"}
                                </button>

                                {/* PREVIOUS */}
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => {
                                        setPageLoading(true);

                                        setTimeout(() => {
                                            setPageMap({
                                                ...pageMap,
                                                [activeTab]: Math.max(currentPage - 1, 1),
                                            });

                                            setPageLoading(false);
                                        }, 400);
                                    }}
                                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer"
                                >
                                    Previous
                                </button>

                                {/* PAGE NUMBER */}
                                <button className="bg-green-800 text-white px-4 py-1 rounded font-medium">
                                    {currentPage}
                                </button>

                                {/* NEXT */}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => {
                                        setPageLoading(true);

                                        setTimeout(() => {
                                            setPageMap({
                                                ...pageMap,
                                                [activeTab]: Math.min(currentPage + 1, totalPages),
                                            });

                                            setPageLoading(false);
                                        }, 400);
                                    }}
                                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer"
                                >
                                    Next
                                </button>

                                {/* LAST */}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => {
                                        setPageLoading(true);

                                        setTimeout(() => {
                                            setPageMap({
                                                ...pageMap,
                                                [activeTab]: totalPages,
                                            });

                                            setPageLoading(false);
                                        }, 400);
                                    }}
                                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer"
                                >
                                    {">>"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <AddApplication
                        onClose={() => {
                            setShowModal(false);
                            setEditingApp(null);
                        }}
                        onAdd={addApplication}
                        editingApp={editingApp}
                        setPopup={setPopup}
                    />
                )}

                {popup.show && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div className="bg-white p-6 rounded-xl w-80 text-center shadow-lg">

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
                                            onClick={async () => {
                                                await popup.onConfirm();
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <FiLoader className="animate-spin" />
                                                    Deleting...
                                                </span>
                                            ) : (
                                                "Yes"
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setPopup({ show: false })}
                                            className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
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

export default Applications;