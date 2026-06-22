import { useState, useEffect } from "react";
import { FiUser, FiPhone, FiFlag, FiClipboard, FiLock, FiClock, FiChevronDown, FiCode, FiMail, FiMapPin, FiUpload, FiFileText, FiCreditCard, FiBriefcase, FiX, FiEye, FiEyeOff } from "react-icons/fi";

function AddClient({ onClose, onAdd, editingClient, setPopup }) {

    const [formData, setFormData] = useState({
        name: "",
        countryCode: "+91",
        mobile: "",
        email: "",
        password: "",
        tech: [],
        status: "Active",
        employeeId: "",
        role: "",
        aadhaar: "",
        location: "",
        startDate: "",
        endDate: "",
        notes: ""
    });

    const [showTechDropdown, setShowTechDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [employeeIds, setEmployeeIds] = useState([]);
    const [isCurrentlyClient, setIsCurrentlyClient] = useState(false);
    const [techOptions, setTechOptions] = useState([]);
    const [techSearch, setTechSearch] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const countryOptions = [
        { code: "+91", label: "India", flag: "🇮🇳" },
        { code: "+1", label: "Canada", flag: "🇨🇦" }
    ];

    const reverseStatusMap = {
        A: "Active",
        C: "Completed",
        P: "Pause",
        T: "Terminate"
    };

    useEffect(() => {
        if (editingClient) {
            setFormData({
                name: editingClient.client_name || "",
                countryCode:
                    editingClient.mobile?.startsWith("+1")
                        ? "+1"
                        : "+91",
                mobile: editingClient.mobile
                    ?.replace(/^\+91/, "")
                    ?.replace(/^\+1/, "") || "",
                email: editingClient.email || "",
                password: editingClient.password || "",
                tech: editingClient.technology
                    ? editingClient.technology.split(",").filter(Boolean)
                    : [],

                status: reverseStatusMap[editingClient.status] || "Active",

                employeeId: editingClient.employee_id
                    ? String(editingClient.employee_id)
                    : "",

                role: editingClient.professional_role || "",
                aadhaar: editingClient.aadhaar_number || "",
                location: editingClient.location || "",
                startDate: editingClient.start_date || "",
                endDate:
                    editingClient.end_date &&
                        editingClient.end_date !== "Currently In Process"
                        ? editingClient.end_date
                        : "",

                notes: editingClient.notes || ""
            });

            // true only when no actual end date exists
            setIsCurrentlyClient(
                !editingClient.end_date ||
                editingClient.end_date === "Currently In Process"
            );
        }
    }, [editingClient]);

    /*fetch employee IDs for dropdown*/
    useEffect(() => {
        const fetchEmployeeIds = async () => {
            try {
                const res = await fetch("https://timesheet-api-790373899641.asia-south1.run.app/employee-ids", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const data = await res.json();
                console.log("Employee IDs:", data);
                setEmployeeIds(data.data || data);
            } catch (error) {
                console.error("Error fetching employee IDs:", error);
            }
        };
        fetchEmployeeIds();
    }, []);

    /*get technology options for dropdown*/
    useEffect(() => {
        const fetchTechnologies = async () => {
            try {
                const res = await fetch(
                    `https://timesheet-api-790373899641.asia-south1.run.app/technologies?search=${techSearch}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                const data = await res.json();

                console.log("Technologies:", data);

                setTechOptions(data || []);

            } catch (error) {
                console.error("Error fetching technologies:", error);
            }
        };

        const timer = setTimeout(() => {
            fetchTechnologies();
        }, 300);

        return () => clearTimeout(timer);

    }, [techSearch]);

    //Handle form input changes
    const handleChange = (e) => {
        let { name, value } = e.target;

        // For mobile, only allow numbers and certain symbols
        if (name === "mobile") {
            value = value.replace(/\D/g, "").slice(0, 10);
        }

        // For aadhaar, only allow numbers and dashes
        if (name === "aadhaar") {
            value = value.replace(/[^0-9\s-]/g, "");
        }

        // Trim multiple spaces → single space
        value = value.replace(/\s+/g, " ");

        // Limit notes to 500 chars
        if (name === "notes") {
            value = value.slice(0, 500);
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const toggleTech = (tech) => {
        setFormData((prev) => ({
            ...prev,
            tech: prev.tech.includes(tech)
                ? prev.tech.filter((t) => t !== tech)
                : [...prev.tech, tech]
        }));
    };

    //submit new or edited client
    const isEdit = !!editingClient;
    const submit = () => {

        // Trim all values before validation
        const trimmedData = {
            ...formData,
            name: formData.name.trim(),
            mobile: formData.mobile.trim(),
            email: formData.email,
            tech: formData.tech,
            status: formData.status,
            employeeId: formData.employeeId,
            role: formData.role,
            aadhaar: formData.aadhaar,
            location: formData.location,
            startDate: formData.startDate,
            endDate: formData.endDate,
            password: formData.password.trim(),
        };

        if (!trimmedData.name) {
            return setPopup({ show: true, message: "Name is required", type: "error" });
        }

        if (!trimmedData.mobile) {
            return setPopup({ show: true, message: "Mobile is required", type: "error" });
        }

        if (trimmedData.mobile) {
            const mobile = trimmedData.mobile.replace(/\D/g, "");

            if (mobile.length !== 10 && mobile.length !== 11 && mobile.length !== 12) {
                return setPopup({
                    show: true,
                    message: "Enter valid mobile number",
                    type: "error"
                });
            }
        }

        if (!trimmedData.email) {
            return setPopup({ show: true, message: "Email is required", type: "error" });
        }

        if (trimmedData.email && !/\S+@\S+\.\S+/.test(trimmedData.email)) {
            return setPopup({
                show: true,
                message: "Invalid email format",
                type: "error"
            });
        }

        // PASSWORD VALIDATION (Add + Update)

        if (!trimmedData.password) {
            return setPopup({
                show: true,
                message: editingClient
                    ? "Assigned password is required"
                    : "Password is required",
                type: "error"
            });
        }

        if (trimmedData.password.length < 8) {
            return setPopup({
                show: true,
                message: "Password must contain at least 8 characters",
                type: "error"
            });
        }

        if (trimmedData.tech.length === 0) {
            return setPopup({ show: true, message: "Select at least one technology", type: "error" });
        }

        if (!trimmedData.employeeId) {
            return setPopup({ show: true, message: "Employee ID is required", type: "error" });
        }

        if (!trimmedData.role) {
            return setPopup({ show: true, message: "Role is required", type: "error" });
        }

        if (!trimmedData.aadhaar) {
            return setPopup({ show: true, message: "Aadhaar is required", type: "error" });
        }

        if (trimmedData.aadhaar && !/^\d{12}$/.test(trimmedData.aadhaar)) {
            return setPopup({
                show: true,
                message: "Aadhaar must be 12 digits",
                type: "error"
            });
        }

        if (!trimmedData.location) {
            return setPopup({ show: true, message: "Location is required", type: "error" });
        }



        if (!formData.startDate) {
            return setPopup({
                show: true,
                message: "Start date is required",
                type: "error"
            });
        }

        if (
            formData.endDate &&
            new Date(formData.endDate) < new Date(formData.startDate)
        ) {
            return setPopup({
                show: true,
                message: "End date cannot be before start date",
                type: "error"
            });
        }

        // Create client object
        const client = {
            ...trimmedData,
            mobile: `${formData.countryCode}${trimmedData.mobile}`,
            endDate: isCurrentlyClient
                ? null
                : formData.endDate || null
        };
        // Call parent update/add function
        onAdd(client);
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">

            <div className="bg-white w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[95vh] overflow-hidden my-4">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 p-4 sm:p-6 border-b border-gray-200">

                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 break-word">
                            {editingClient ? "Update Client" : "Add New Client"}
                        </h2>
                    </div>

                </div>

                {/* BODY */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">

                    {/* Client Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Client Name <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <FiUser className="text-gray-400 mr-2 shrink-0" />

                            <input
                                name="name"
                                value={formData.name}
                                placeholder="e.g. Acme Corporation"
                                onChange={handleChange}
                                className="w-full py-3 outline-none text-sm bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Mobile Number <span className="text-red-500">*</span>
                        </label>

                        <div className="flex border border-gray-200 bg-gray-50 rounded-xl mt-2 relative">

                            {/* Country Dropdown */}
                            <div className="relative">

                                <div
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                    className="flex items-center justify-between px-3 py-3 border-r border-gray-200 cursor-pointer w-32.5"
                                >
                                    <div className="flex items-center text-sm font-medium">
                                        <span>
                                            {formData.countryCode === "+91" ? "IN" : "CA"}
                                        </span>

                                        <span className="ml-2">
                                            {formData.countryCode}
                                        </span>
                                    </div>

                                    <FiChevronDown
                                        className={`transition-transform ${showCountryDropdown ? "rotate-180" : ""
                                            }`}
                                    />
                                </div>

                                {showCountryDropdown && (
                                    <div
                                        className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg w-32.5 z-50"
                                    >
                                        {countryOptions.map((country) => (
                                            <div
                                                key={country.code}
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        countryCode: country.code
                                                    });
                                                    setShowCountryDropdown(false);
                                                }}
                                                className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer"
                                            >
                                                <span className="font-medium">
                                                    {country.code === "+91" ? "IN" : "CA"}
                                                </span>

                                                <span className="text-gray-500">
                                                    {country.code}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Input */}
                            <div className="flex items-center flex-1 px-3">
                                <FiPhone className="text-gray-400 mr-2" />

                                <input
                                    name="mobile"
                                    value={formData.mobile}
                                    placeholder="Enter mobile number"
                                    onChange={handleChange}
                                    className="w-full py-3 outline-none text-sm bg-transparent"
                                />
                            </div>

                        </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <FiMail className="text-gray-400 mr-2 shrink-0" />

                            <input
                                name="email"
                                value={formData.email}
                                placeholder="example@gmail.com"
                                onChange={handleChange}
                                className="w-full py-3 outline-none text-sm bg-transparent"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            {editingClient
                                ? "Assigned Password"
                                : "Assign Password"}{" "}
                            <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">

                            <FiLock className="text-gray-400 mr-2 shrink-0" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                className="w-full py-3 outline-none text-sm bg-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-500 ml-2"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>

                        </div>
                    </div>

                    {/* Tech + Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* TECH STACK */}
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700">
                                Technology Stack <span className="text-red-500">*</span>
                            </label>

                            <div
                                onClick={() => setShowTechDropdown(!showTechDropdown)}
                                className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3 py-3 cursor-pointer"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <FiCode className="text-gray-400 shrink-0" />

                                    <span className="text-sm text-gray-700 truncate cursor-pointer max-w-45 sm:max-w-full">
                                        {formData.tech.length > 0
                                            ? formData.tech.join(", ")
                                            : "Select technologies"}
                                    </span>
                                </div>

                                <FiChevronDown
                                    className={`text-gray-500 transition-transform duration-200 shrink-0
                                    ${showTechDropdown ? "rotate-180" : ""}`}
                                />
                            </div>

                            {showTechDropdown && (
                                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow">
                                    {/* Search input + clear button */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search technologies..."
                                            value={techSearch}
                                            onChange={(e) => setTechSearch(e.target.value)}
                                            className="w-full p-2 outline-none text-sm"
                                        />

                                        {techSearch && (
                                            <FiX
                                                onClick={() => setTechSearch("")}
                                                className="
                                                absolute right-3 top-1/2
                                                -translate-y-1/2
                                                text-gray-400
                                                hover:text-red-500
                                                cursor-pointer
                                            "
                                            />
                                        )}
                                    </div>

                                    <div className="max-h-40 overflow-y-auto">
                                        {techOptions.map((tech) => (
                                            <label
                                                key={tech}
                                                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.tech.includes(tech)}
                                                    onChange={() => toggleTech(tech)}
                                                    className="mr-2 accent-green-700"
                                                />

                                                <span>{tech}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* STATUS */}
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700">
                                Initial Status <span className="text-red-500">*</span>
                            </label>

                            <div
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3 py-3 cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <FiFlag className="text-gray-400 shrink-0" />

                                    <span className="text-sm text-gray-700 truncate">
                                        {formData.status || "Select Status"}
                                    </span>
                                </div>

                                <FiChevronDown
                                    className={`text-gray-500 transition-transform duration-200 shrink-0
                                    ${showStatusDropdown ? "rotate-180" : ""}`}
                                />
                            </div>

                            {showStatusDropdown && (
                                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow max-h-52 overflow-y-auto">
                                    {["Active", "Completed", "Pause", "Terminate"].map((item) => (
                                        <label
                                            key={item}
                                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={formData.status === item}
                                                onChange={() => {
                                                    setFormData({ ...formData, status: item });
                                                    setShowStatusDropdown(false);
                                                }}
                                                className="mr-2 accent-green-700 shrink-0"
                                            />
                                            {item}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Employee ID */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700">
                            Assigned Employee ID <span className="text-red-500">*</span>
                        </label>

                        <div
                            onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                            className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3 py-3 cursor-pointer select-none"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <FiUser className="text-gray-400 shrink-0" />

                                <span className="text-sm text-gray-700 truncate">
                                    {formData.employeeId || "Select Employee ID"}
                                </span>
                            </div>

                            <FiChevronDown
                                className={`text-gray-500 transition-transform duration-200 shrink-0
                                ${showEmployeeDropdown ? "rotate-180" : ""}`}
                            />
                        </div>

                        {showEmployeeDropdown && (
                            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow max-h-52 overflow-y-auto">
                                {employeeIds.map((tz) => (
                                    <label
                                        key={tz}
                                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            checked={formData.employeeId === tz}
                                            onChange={() => {
                                                setFormData({ ...formData, employeeId: tz });
                                                setShowEmployeeDropdown(false);
                                            }}
                                            className="mr-2 accent-green-700 shrink-0"
                                        />
                                        {tz}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ROLE + AADHAAR */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Professional Role <span className="text-red-500">*</span>
                            </label>

                            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                                <FiBriefcase className="text-gray-400 mr-2 shrink-0" />

                                <input
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="e.g. Java Developer"
                                    className="w-full py-3 outline-none text-sm bg-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Aadhaar / ID Number <span className="text-red-500">*</span>
                            </label>

                            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                                <FiCreditCard className="text-gray-400 mr-2 shrink-0" />

                                <input
                                    name="aadhaar"
                                    value={formData.aadhaar}
                                    onChange={handleChange}
                                    placeholder="0000-0000-0000"
                                    className="w-full py-3 outline-none text-sm bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* LOCATION */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Location <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <FiMapPin className="text-gray-400 mr-2 shrink-0" />

                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                                className="w-full py-3 text-sm outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* START DATE + END DATE */}
                    {/* START DATE */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Start Date <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <FiClock className="text-gray-400 mr-2 shrink-0" />

                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full py-3 outline-none text-sm bg-transparent"
                            />
                        </div>
                    </div>

                    {/* END DATE + CURRENTLY CLIENT */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            End Date
                        </label>

                        {/* TOGGLE */}
                        <div className="flex items-center gap-2 mt-2">

                            <input
                                type="checkbox"
                                checked={isCurrentlyClient}
                                onChange={() => {
                                    setIsCurrentlyClient(!isCurrentlyClient);

                                    setFormData({
                                        ...formData,
                                        endDate: ""
                                    });
                                }}
                                className="accent-green-700 cursor-pointer"
                            />

                            <label className="text-sm text-gray-600">
                                Currently In Process
                            </label>
                        </div>

                        {/* DATE INPUT */}
                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <FiClock className="text-gray-400 mr-2 shrink-0" />

                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate || ""}
                                onChange={handleChange}
                                disabled={isCurrentlyClient}
                                className="w-full py-3 outline-none text-sm bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* NOTES */}
                    <div>
                        <div className="flex justify-between items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Notes / Description
                            </label>

                            <p
                                className={`text-xs text-right shrink-0
                                ${formData.notes.length === 500
                                        ? "text-red-500"
                                        : "text-gray-500"}`}
                            >
                                {formData.notes.length}/500
                            </p>
                        </div>

                        <textarea
                            name="notes"
                            value={formData.notes}
                            placeholder="Add additional details or context about this client..."
                            onChange={handleChange}
                            rows="4"
                            maxLength={500}
                            className="w-full mt-2 border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm outline-none resize-none"
                        />
                    </div>

                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-6 p-4 sm:p-6 border-t border-gray-200 bg-white z-10">

                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto text-gray-600 border border-gray-300 hover:text-black cursor-pointer px-6 py-2 rounded-lg transition hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={submit}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow cursor-pointer"
                    >
                        {editingClient ? "Update Client" : "Add Client"}
                    </button>

                </div>

            </div>
        </div>
    );
}

export default AddClient;