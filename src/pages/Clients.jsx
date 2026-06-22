import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiSearch, FiLoader, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddClient from "./AddClient";

const BASE_URL = "https://timesheet-api-790373899641.asia-south1.run.app";
const statusMap = {
    Active: "A",
    Completed: "C",
    Pause: "P",
    Terminate: "T"
};

function Clients() {
    const navigate = useNavigate();
    const role = localStorage
        .getItem("role")
        ?.toLowerCase()
        ?.trim();
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "", // success | error | confirm
        onConfirm: null
    });

    // helper to get headers with token
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        };
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // FETCH CLIENTS
    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/clients/clients`, getAuthHeaders());
            console.log("Fetched clients:", res.data);
            console.log("Client state check:", res.data);
            setClients(res.data);
            return res; // return response for chaining
        } catch (err) {
            console.error("ERROR:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);


    // ADD OR UPDATE CLIENT
    const addClient = async (client) => {
        try {
            setLoading(true);
            if (!client.name.trim())
                return setPopup({ show: true, message: "Name is required", type: "error" });

            if (!client.mobile.trim())
                return setPopup({ show: true, message: "Mobile is required", type: "error" });

            if (!client.email.trim())
                return setPopup({ show: true, message: "Email is required", type: "error" });

            if (!client.tech.length)
                return setPopup({ show: true, message: "Technology is required", type: "error" });

            if (!client.status)
                return setPopup({ show: true, message: "Status is required", type: "error" });

            if (!client.employeeId)
                return setPopup({ show: true, message: "Employee ID is required", type: "error" });

            if (!client.role.trim())
                return setPopup({ show: true, message: "Role is required", type: "error" });

            if (!client.aadhaar.trim())
                return setPopup({ show: true, message: "Aadhaar is required", type: "error" });

            if (!client.location.trim())
                return setPopup({ show: true, message: "Location is required", type: "error" });

            const formData = new FormData();

            formData.append("client_name", client.name);
            formData.append("mobile", client.mobile);
            formData.append("email", client.email);
            formData.append("password", client.password); // For new clients, a default password can be set. For updates, it can be ignored or handled separately.
            formData.append("technology", client.tech.join(","));
            formData.append("status", statusMap[client.status]);
            formData.append("employee_id", String(client.employeeId));
            formData.append("professional_role", client.role);
            formData.append("aadhaar_number", client.aadhaar);
            formData.append("location", client.location);
            formData.append("start_date", client.startDate);
            formData.append(
                "end_date",
                client.endDate || ""
            );
            formData.append("notes", client.notes);

            // DEBUG (optional but useful)
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            if (editingClient) {

                // UPDATE
                const client_id = editingClient.client_id || editingClient.id;
                console.log("Updating client with ID:", client_id);
                const response = await axios.put(`${BASE_URL}/clients/update-client/${client_id}`, formData, {
                    ...getAuthHeaders(),
                    headers: {
                        ...getAuthHeaders().headers,
                        "Content-Type": "multipart/form-data"
                    }
                });
                console.log("Update response:", response.data);

            } else {
                // CREATE
                console.log("Creating new client");
                const response = await axios.post(`${BASE_URL}/clients/create-client`, formData, {
                    ...getAuthHeaders(),
                    headers: {
                        ...getAuthHeaders().headers,
                        "Content-Type": "multipart/form-data"
                    }
                }
                );
                console.log("Create response:", response.data);
            }

            const res = await fetchClients();
            console.log("Fetched clients after save:", res.data);

            setShowModal(false);
            setEditingClient(null);

            setPopup({
                show: true,
                message: editingClient ? "Client updated successfully" : "Client added successfully",
                type: "success"
            });

        } catch (error) {
            console.error("FULL ERROR:", error.response?.data || error.message);

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data?.detail ||
                error.message ||
                "An error occurred while saving the client";

            setPopup({
                show: true,
                message: backendMessage,
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // DELETE CLIENT
    const deleteClient = async (client_id) => {
        if (!client_id) {
            console.error("Invalid client ID for deletion", client_id);
            setPopup({
                show: true,
                message: "Invalid client ID",
                type: "error"
            });

            return;
        }

        setPopup({
            show: true,
            message: "Are you sure you want to delete this client?",
            type: "confirm",
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const response = await axios.delete(`${BASE_URL}/clients/clients/${client_id}`, getAuthHeaders());
                    console.log("Delete response:", response.data);

                    //refresh
                    const res = await fetchClients();
                    console.log("Fetched data after deletion", res.data);

                    setPopup({
                        show: true,
                        message: "Client deleted successfully",
                        type: "success"
                    });
                } catch (error) {
                    console.error("Error in deleting client:", error.response?.data || error.message);
                    setPopup({
                        show: true,
                        message: "Error while deleting client",
                        type: "error"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // EDIT CLIENT
    const editClient = (client) => {
        setEditingClient({
            ...client,
            client_name: client.client_name,
            mobile: client.mobile,
            email: client.email,
            technology: client.technology,
            status: client.status,
            employee_id: client.employee_id,
            professional_role: client.professional_role,
            aadhaar_number: client.aadhaar_number,
            location: client.location,
            start_date: client.start_date,
            end_date: client.end_date,
            notes: client.notes
        });

        setShowModal(true);
    };

    const filteredClients = clients.filter((client) => {
        const searchValue = search.toLowerCase().trim();
        const statusText =
            client.status === "A"
                ? "active"
                : client.status === "C"
                    ? "completed"
                    : client.status === "P"
                        ? "pause"
                        : client.status === "T"
                            ? "terminate"
                            : "";
        return (
            client.client_name?.toLowerCase().includes(searchValue) ||
            client.mobile?.toLowerCase().includes(searchValue) ||
            client.technology?.toLowerCase().includes(searchValue) ||
            client.employee_name?.toLowerCase().includes(searchValue) ||
            statusText.includes(searchValue)
        );
    });


    const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <div className="p-3 sm:p-4 md:p-6">
            {/*loader*/}
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
            {/* SEARCH */}
            <div className="w-full sm:w-1/2">
                <div className="relative flex items-center bg-gray-100 px-4 py-2 rounded-full shadow-sm">

                    <FiSearch className="text-gray-400 mr-2" />

                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm"
                    />

                    {search && (
                        <FiX
                            onClick={() => setSearch("")}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        />
                    )}

                </div>
            </div>

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pt-2">

                <div>
                    <h1 className="text-3xl font-bold">All Clients</h1>
                    <p className="text-gray-500">
                        Manage and monitor your enterprise client base across all regions.
                    </p>
                </div>
                {role !== "employee" && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 cursor-pointer"
                    >
                        Add New Client
                    </button>
                )}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">

                    <table className="min-w-175 w-full text-md">

                        <thead className="bg-gray-100 text-gray-800">
                            <tr>
                                <th className="p-4 text-left">NAME</th>
                                <th className="p-4 text-left">MOBILE NUMBER</th>
                                <th className="p-4 text-left">TECHNOLOGY STACK</th>
                                <th className="p-4 text-left">ASSIGNED TO</th>
                                <th className="p-4 text-left">STATUS</th>
                                <th className="p-4 text-left">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredClients.length === 0 ? (

                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-400">
                                        No clients available. Click "Add New Client".
                                    </td>
                                </tr>

                            ) : (

                                currentClients.map((client) => (

                                    <tr key={client.client_id || client.id || `${client.client_name}-${client.mobile}`} className="text-left hover:bg-gray-50">
                                        {/* NAME */}
                                        <td
                                            className="p-4 cursor-pointer hover:underline truncate max-w-37.5"
                                            title={client.client_name || "No Name"}
                                            onClick={() => {
                                                setPageLoading(true);

                                                setTimeout(() => {
                                                    navigate(`/clients/${client.client_id || client.id}`, {
                                                        state: {
                                                            clientName: client.client_name || "No Name",
                                                        },
                                                    });
                                                }, 500);
                                            }}
                                        >
                                            {(client.client_name || "No Name").length > 15
                                                ? (client.client_name || "No Name").slice(0, 15) + "..."
                                                : (client.client_name || "No Name")}
                                        </td>

                                        {/* MOBILE */}
                                        <td className="p-4">{client.mobile}</td>

                                        {/* TECH STACK */}
                                        <td
                                            className="p-4 space-x-2 max-w-50 truncate"
                                            title={client.technology}
                                        >
                                            {client.technology
                                                ?.split(",")
                                                .slice(0, 4)
                                                .map((t, i) => (
                                                    <span
                                                        key={`${client.client_id || client.id}-${t}-${i}`}
                                                        className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs mr-1 inline-block"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}

                                            {client.technology?.split(",").length > 4 && (
                                                <span className="text-xs text-gray-500">
                                                    +{client.technology.split(",").length - 4} more
                                                </span>
                                            )}
                                        </td>

                                        {/*Assigned to Employee*/}
                                        <td className="p-4">
                                            {client.employee_name || "Unassigned"}
                                        </td>
                                        {/* STATUS */}
                                        <td className="p-4">

                                            <span className={`px-3 py-1 rounded-full text-xs
                                                ${client.status === "A" && "bg-green-100 text-green-700"}
                                                ${client.status === "C" && "bg-gray-200 text-gray-700"}
                                                ${client.status === "P" && "bg-yellow-100 text-yellow-700"}
                                                ${client.status === "T" && "bg-red-100 text-red-600"}`}
                                            >
                                                {client.status === "A" ? "Active" :
                                                    client.status === "C" ? "Completed" :
                                                        client.status === "P" ? "Pause" :
                                                            client.status === "T" ? "Terminate" : "Unknown"}
                                            </span>

                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-4 flex gap-3 sm:gap-4 text-gray-500 flex-wrap">
                                            <FiEdit
                                                size={18}
                                                className="cursor-pointer hover:text-green-600"
                                                onClick={() => editClient(client)}
                                            />

                                            <FiTrash2
                                                size={18}
                                                className="cursor-pointer hover:text-green-600"
                                                onClick={() => deleteClient(client.client_id || client.id)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* PAGINATION */}
                    <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 gap-4">

                        {/* LEFT SIDE */}
                        <div className="text-sm text-gray-500">
                            {filteredClients.length === 0
                                ? "No clients available"
                                : `Showing ${currentClients.length} of ${filteredClients.length} clients`}
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="flex flex-wrap items-center gap-2">

                            {/* FIRST PAGE */}
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1 || loading}
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
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || loading}
                                className={`px-3 py-1 rounded border
                                    ${currentPage === 1
                                        ? "text-gray-300 cursor-not-allowed border-gray-200"
                                        : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                    }`}
                            >
                                Prev
                            </button>

                            {/* PAGE NUMBERS */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }
                                disabled={currentPage === totalPages || loading}
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
                                disabled={currentPage === totalPages || loading}
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
                </div>
            </div>
            {/* MODAL */}
            {showModal && (
                <AddClient
                    onClose={() => {
                        setShowModal(false);
                        setEditingClient(null);
                    }}
                    onAdd={addClient}
                    editingClient={editingClient}
                    setPopup={setPopup}
                />

            )}

            {/* POPUP */}

            {popup.show && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-50 px-2">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">

                        <p className={`text-lg font-semibold mb-4
                ${popup.type === "success" && "text-green-600"}
                ${popup.type === "error" && "text-red-600"}
                ${popup.type === "confirm" && "text-gray-800"}
            `}>
                            {popup.message}
                        </p>

                        {/* BUTTONS */}
                        <div className="flex justify-center gap-3">

                            {popup.type === "confirm" ? (
                                <>
                                    <button
                                        onClick={async () => {
                                            await popup.onConfirm();
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer hover:bg-red-500"
                                    >
                                        Yes
                                    </button>

                                    <button
                                        onClick={() => setPopup({ show: false })}
                                        className="px-4 py-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setPopup({ show: false })}
                                    className="px-4 py-2 bg-green-800 text-white rounded-full hover:bg-green-700 cursor-pointer"
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

export default Clients;