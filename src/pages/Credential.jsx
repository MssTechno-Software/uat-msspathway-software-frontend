import { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiEdit, FiTrash2, FiSearch, FiX, FiLoader } from "react-icons/fi";
import AddCredential from "./AddCredential";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = axios.create({
    baseURL: "https://timesheet-api-790373899641.asia-south1.run.app",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

function Credentials() {

    const { client_id } = useParams();
    const [credentials, setCredentials] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const ITEMS_PER_PAGE = 10;
    const credential_id = editing?.id;

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "",
        onConfirm: null
    });

    useEffect(() => {
        const fetchCredentials = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/credentials/${client_id}`);
                console.log("editing credentials response:", res.data);

                const data = Array.isArray(res.data?.credentials)
                    ? res.data.credentials
                    : [];

                const formatted = data.map((item, index) => ({
                    id: item.id || index,
                    portal: item.portal_name,
                    portalLink: item.portal_link,
                    email: item.username,
                    password: item.password,
                    notes: item.notes,
                    date: item.created_at || item.date
                }));

                setCredentials(formatted);
            } catch (err) {
                console.error("Failed to fetch credentials:", err.response?.data || err.message);
                console.error("ERROR:", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        if (client_id) fetchCredentials();
    }, [client_id]);

    const saveCredential = async (data) => {
        try {
            setLoading(true);
            const payload = {
                portal_name: data.portal,
                portal_link: data.portalLink,
                username: data.email,
                password: data.password,
                notes: data.notes || ""
            };

            console.log("Payload being sent:", payload);

            if (editing) {
                // UPDATE
                const response = await API.put(`/credentials/update/${credential_id}`, payload);
                console.log("Update response:", response.data);
            } else {
                // CREATE
                const response = await API.post(`/credentials/create_credentials/${client_id}`, payload);
                console.log("Create response:", response.data);
            }

            // REFRESH
            const res = await API.get(`/credentials/${client_id}`);
            console.log("Fetched credentials after save:", res.data);

            const responseData = Array.isArray(res.data?.credentials)
                ? res.data.credentials
                : [];

            const updated = responseData.map((item, index) => ({
                id: item.id || index,
                portal: item.portal_name,
                portalLink: item.portal_link,
                email: item.username,
                password: item.password,
                notes: item.notes,
                date: item.created_at || item.date
            }));

            setCredentials(updated);
            setEditing(null);
            setShowModal(false);
            setPopup({
                show: true,
                message: editing
                    ? "Credential updated successfully."
                    : "Credential added successfully.",
                type: "success"
            });
        } catch (err) {
            console.error("ERROR:", err.response?.data || err.message);
            setLoading(false);
            setPopup({
                show: true,
                message: "Failed to save credential. Please try again.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // DELETE
    const deleteCredential = async (credential_id) => {
        setPopup({
            show: true,
            message: "Are you sure you want to delete this credential?",
            type: "confirm",
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const response = await API.delete(`/credentials/delete/${credential_id}`);
                    console.log("Delete response:", response.data);

                    // Refresh
                    const res = await API.get(`/credentials/${client_id}`);
                    console.log("Fetched credentials after delete:", res.data);
                    const responseData = Array.isArray(res.data?.credentials)
                        ? res.data.credentials
                        : [];
                    const updated = responseData.map((item, index) => ({
                        id: item.id || index,
                        portal: item.portal_name,
                        portalLink: item.portal_link,
                        email: item.username,
                        password: item.password,
                        notes: item.notes
                    }));
                    setCredentials(updated);
                    setPopup({
                        show: true,
                        message: "Credential deleted successfully.",
                        type: "success"
                    });


                } catch (err) {
                    console.error("ERROR:", err.response?.data || err.message);
                    setPopup({
                        show: true,
                        message: "Failed to delete credential. Please try again.",
                        type: "error"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // EDIT
    const editCredential = async (credential_id) => {
        console.log("Editing Credential ID:", credential_id);
        try {
            const res = await API.get(`/credentials/credentials/${credential_id}`);

            const data = res.data?.data || res.data;

            setEditing({
                id: data.id,
                portal: data.portal_name,
                portalLink: data.portal_link,
                email: data.username,
                password: data.password,
                notes: data.notes
            });

            setShowModal(true);

        } catch (error) {
            console.error("Error fetching credential:", error);
            setPopup({
                show: true,
                message: "Failed to edit credentials.",
                type: "error"
            });
        }
    };

    // TOGGLE PASSWORD
    const togglePassword = (id) => {
        setVisiblePasswords({
            ...visiblePasswords,
            [id]: !visiblePasswords[id],
        });
    };

    // SEARCH FILTER
    const filtered = credentials.filter(
        (c) =>
            (c.portal || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.email || "").toLowerCase().includes(search.toLowerCase())
    );

    // PAGINATION
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
            {(loading || pageLoading || loadingEdit) && (
                <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">

                    <div className="p-6 flex flex-col items-center gap-3">

                        <FiLoader className="animate-spin text-4xl text-green-800" />

                        <p className="text-gray-800 font-medium">
                            Please wait...
                        </p>

                    </div>
                </div>
            )}

            <div className="bg-gray-50 min-h-screen w-full">

                {/* MAIN CONTENT */}
                <div className="w-full p-4 sm:p-6">

                    {/* TITLE */}
                    <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 pb-5">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold">Portal Credentials</h1>
                            <p className="text-gray-500 mt-1">
                                Manage and store access details for various client portals.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

                            {/* SEARCH BAR */}
                            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full shadow-sm w-full sm:w-auto">
                                <FiSearch className="text-gray-400 mr-2" />
                                <input
                                    placeholder="Search portals..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="outline-none w-full bg-transparent text-sm min-w-0 sm:min-w-55"
                                />

                                {search && (
                                    <button
                                        onClick={() => {
                                            setSearch("");
                                            setCurrentPage(1);
                                        }}
                                        className="ml-2 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                                    >
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>

                            {/* ADD BUTTON */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition"
                            >
                                Add New Credential
                            </button>

                        </div>

                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-gray-50 w-full">
                        <div className="overflow-x-auto">

                            <table className="min-w-225 w-full text-sm">

                                {/* HEADER */}
                                <thead className="bg-gray-100 text-gray-800 text-sm tracking-wider uppercase">
                                    <tr>
                                        <th className="p-4 text-left">Portal Name</th>
                                        <th className="p-4 text-left">Email Address</th>
                                        <th className="p-4 text-left">Password</th>
                                        <th className="p-4 text-left">Portal Link</th>
                                        <th className="p-4 text-left">Actions</th>
                                    </tr>
                                </thead>

                                {/* BODY */}
                                <tbody>

                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-gray-400">
                                                No credentials found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item, index) => (

                                            <tr
                                                key={item.id || index}
                                                className="border-t border-gray-100 hover:bg-gray-50 transition duration-150 cursor-pointer"
                                            >

                                                {/* PORTAL NAME */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-gray-800 wrap-break-word">
                                                            {item.portal}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* EMAIL */}
                                                <td className="p-4 text-gray-600 gap-3 break-all">
                                                    {item.email}
                                                </td>

                                                {/* PASSWORD */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">

                                                        <span className="tracking-widest text-gray-700">
                                                            {visiblePasswords[item.id]
                                                                ? item.password
                                                                : "•".repeat(item.password.length)}
                                                        </span>

                                                        <button
                                                            onClick={() => togglePassword(item.id)}
                                                            className="text-gray-400 hover:text-gray-700 transition cursor-pointer"
                                                        >
                                                            {visiblePasswords[item.id] ? <FiEyeOff /> : <FiEye />}
                                                        </button>

                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <a
                                                        href={item.portalLink}
                                                        target="_blank"
                                                        className="text-green-700 font-medium cursor-pointer hover:underline"
                                                    >
                                                        View ↗
                                                    </a>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">

                                                        <button
                                                            onClick={() => {
                                                                console.log("Edit button clicked", item.id);
                                                                editCredential(item.id)
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-green-50 transition cursor-pointer"
                                                        >
                                                            <FiEdit size={18} className="text-gray-500 hover:text-green-600" />
                                                        </button>

                                                        <button
                                                            onClick={() => deleteCredential(item.id)}
                                                            className="p-2 rounded-lg hover:bg-green-50 transition cursor-pointer"
                                                        >
                                                            <FiTrash2 size={18} className="text-gray-500 hover:text-green-600" />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-t border-gray-200 bg-gray-50">

                            <div className="text-sm text-gray-500">
                                Showing {paginated.length} of {filtered.length} credentials
                            </div>

                            <div className="flex flex-wrap justify-center items-center gap-2">

                                {/* FIRST PAGE */}
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                    className={`px-3 py-1 rounded border
                                        ${currentPage === 1
                                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                            : "bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                                        }`}
                                >
                                    {"<<"}
                                </button>

                                {/* PREVIOUS */}
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                                    }
                                    className={`px-3 py-1 rounded border
                                        ${currentPage === 1
                                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                            : "bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                                        }`}
                                >
                                    Previous
                                </button>

                                {/* CURRENT PAGE */}
                                <button className="bg-green-800 text-white px-3 py-1 rounded border border-green-800 cursor-pointer">
                                    {currentPage}
                                </button>

                                {/* NEXT */}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                    className={`px-3 py-1 rounded border
                                        ${currentPage === totalPages
                                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                            : "bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                                        }`}
                                >
                                    Next
                                </button>

                                {/* LAST PAGE */}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`px-3 py-1 rounded border
                                        ${currentPage === totalPages
                                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                            : "bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                                        }`}
                                >
                                    {">>"}
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <AddCredential
                        onClose={() => {
                            setShowModal(false);
                            setEditing(null);
                        }}
                        onSave={saveCredential}
                        editingData={editing}
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
                                            onClick={async () => {
                                                const confirmFn = popup.onConfirm;

                                                // Close confirm popup first
                                                setPopup({
                                                    show: false,
                                                    message: "",
                                                    type: "",
                                                    onConfirm: null
                                                });

                                                // Then run delete
                                                if (confirmFn) {
                                                    await confirmFn();
                                                }
                                            }}
                                            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                                        >
                                            Yes
                                        </button>

                                        <button
                                            onClick={() => setPopup({ show: false })}
                                            className="bg-gray-300 px-4 py-2 rounded cursor-pointer"
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

export default Credentials;