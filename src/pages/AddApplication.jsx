import { useState, useEffect } from "react";
import { FiX, FiLink, FiCalendar, FiChevronDown } from "react-icons/fi";
import BulkUploadApplications from "./BulkUploadApplications";

function AddApplication({
    onClose,
    onAdd,
    onBulkUpload,
    editingApp,
    setPopup,
}) {

    const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
    const [bulkUploadCount, setBulkUploadCount] = useState(0);
    const [bulkUploadAction, setBulkUploadAction] = useState(null);
    const [activeMode, setActiveMode] = useState("single");

    const today = new Date().toISOString().split("T")[0];

    const [form, setForm] = useState({
        company: "",
        role: "",
        platform: "",
        date: today,
        link: "",
        notes: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        if (editingApp) {
            setForm({
                company: editingApp.company || "",
                role: editingApp.role || "",
                platform: editingApp.platform || "",
                date: editingApp.date || today,
                link: editingApp.link || "",
                notes: editingApp.notes || ""
            });
        }
    }, [editingApp]);

    const handleSubmit = () => {
        const trimmedForm = {
            company: form.company.trim(),
            role: form.role.trim(),
            platform: form.platform,
            date: form.date,
            link: form.link.trim(),
            notes: form.notes.trim()
        };

        if (!trimmedForm.company) {
            return setPopup({
                show: true,
                message: "Company name is required",
                type: "error"
            });
        }

        if (!trimmedForm.role) {
            return setPopup({
                show: true,
                message: "Role is required",
                type: "error"
            });
        }

        if (
            !trimmedForm.platform ||
            trimmedForm.platform === "Select a platform"
        ) {
            return setPopup({
                show: true,
                message: "Platform is required",
                type: "error"
            });
        }

        if (!trimmedForm.date) {
            return setPopup({
                show: true,
                message: "Date is required",
                type: "error"
            });
        }

        if (!trimmedForm.link) {
            return setPopup({
                show: true,
                message: "Application link is required",
                type: "error"
            });
        }

        // Validate URL
        if (trimmedForm.link) {
            let value = trimmedForm.link.trim();

            // if (!/^https?:\/\//i.test(value)) {
            //     value = "https://" + value;
            // }

            console.log("Validating URL:", value);

            const urlPattern = /^https:\/\//;

            if (!urlPattern.test(value)) {
                return setPopup({
                    show: true,
                    message: "Enter valid link",
                    type: "error"
                });
            }

            // Save cleaned link
            trimmedForm.link = value;
        }

        onAdd(trimmedForm);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">

            <div className="bg-white w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-2xl shadow-xl max-h-[95vh] flex flex-col my-4 overflow-hidden">

                {/* HEADER */}
                <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">

                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 wrap-break-word">
                            {editingApp
                                ? "Update Application"
                                : "Add New Application Entry"}
                        </h2>

                        <p className="text-gray-500 text-sm mt-1">
                            Keep track of your career journey. Fill in the job details below.
                        </p>
                    </div>

                </div>

                {/* Application Mode Tabs */}
                <div className="px-8 pt-4 bg-white border-b border-slate-200 shrink-0">

                    <div className="flex items-end gap-1">

                        {/* Add Application */}
                        <button
                            type="button"
                            onClick={() => setActiveMode("single")}
                            className={`px-5 py-3 text-sm font-semibold tracking-wide rounded-t-xl border-b-2 transition-all duration-200
                                ${
                                    activeMode === "single"
                                        ? "bg-white text-green-700 border-transparent shadow-[0_-1px_8px_rgba(22,163,74,0.06)]"
                                        : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            Add Application
                        </button>

                        {/* Bulk Upload */}
                        <button
                            type="button"
                            onClick={() => setActiveMode("bulk")}
                            className={`px-5 py-3 text-sm font-semibold tracking-wide rounded-t-xl border-b-2 transition-all duration-200
                                ${
                                    activeMode === "bulk"
                                        ? "bg-white text-green-700 border-transparent shadow-[0_-1px_8px_rgba(22,163,74,0.06)]"
                                        : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            Bulk Upload
                        </button>

                    </div>

                </div>

                {/* BODY */}
                <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto min-h-0">

                    {/* =========================
                        SINGLE APPLICATION
                    ========================== */}
                    <div
                        className={
                            activeMode === "single"
                                ? "block"
                                : "hidden"
                        }
                    >

                        <div className="space-y-5">

                            {/* Row 1 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Company Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        name="company"
                                        value={form.company}
                                        onChange={handleChange}
                                        placeholder="e.g. Acme Corp"
                                        className="w-full mt-2 border rounded-xl p-3 bg-gray-50 outline-none border-gray-200"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Role of Application{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Designer"
                                        className="w-full mt-2 border rounded-xl p-3 bg-gray-50 outline-none border-gray-200"
                                    />
                                </div>

                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div className="relative">

                                    <label className="text-sm font-medium text-gray-700">
                                        Select Platform{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <div
                                        onClick={() =>
                                            setShowPlatformDropdown(
                                                !showPlatformDropdown
                                            )
                                        }
                                        className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3 py-3 cursor-pointer"
                                    >

                                        <div className="flex items-center gap-2 min-w-0">

                                            <span className="text-sm text-gray-700 truncate cursor-pointer max-w-45 sm:max-w-full">
                                                {form.platform ||
                                                    "Select a platform"}
                                            </span>

                                        </div>

                                        <FiChevronDown
                                            className={`text-gray-500 transition-transform duration-200
                                                ${
                                                    showPlatformDropdown
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                        />

                                    </div>

                                    {showPlatformDropdown && (
                                        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow max-h-52 overflow-y-auto">

                                            {[
                                                "Naukri",
                                                "LinkedIn",
                                                "Career Pages",
                                                "Cold Emails",
                                                "Other"
                                            ].map((item) => (

                                                <label
                                                    key={item}
                                                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                >

                                                    <input
                                                        type="radio"
                                                        name="platform"
                                                        checked={
                                                            form.platform ===
                                                            item
                                                        }
                                                        onChange={() => {
                                                            setForm({
                                                                ...form,
                                                                platform: item
                                                            });

                                                            setShowPlatformDropdown(
                                                                false
                                                            );
                                                        }}
                                                        className="mr-2 accent-green-700"
                                                    />

                                                    {item}

                                                </label>

                                            ))}

                                        </div>
                                    )}

                                </div>

                                <div>

                                    <label className="text-sm font-medium text-gray-700">
                                        Date Applied{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative">

                                        <input
                                            type="date"
                                            name="date"
                                            value={form.date}
                                            min={today}
                                            max={today}
                                            onChange={handleChange}
                                            className="w-full mt-2 border rounded-xl p-3 bg-gray-50 outline-none border-gray-200"
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* Link */}
                            <div>

                                <label className="text-sm font-medium text-gray-700">
                                    Application Link{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <div className="flex items-center mt-2 h-11 px-3 rounded-xl bg-gray-50 border border-gray-200">

                                    <FiLink className="text-gray-400 mr-2" />

                                    <input
                                        name="link"
                                        value={form.link}
                                        onChange={handleChange}
                                        placeholder="https://company.com/careers/job-123"
                                        className="w-full h-full outline-none bg-transparent text-sm"
                                    />

                                </div>

                            </div>

                            {/* Notes */}
                            <div>

                                <div className="flex justify-between items-center gap-3">

                                    <label className="text-sm font-medium text-gray-700">
                                        Internal Notes (Optional)
                                    </label>

                                    <p
                                        className={`text-xs mt-1 text-right
                                            ${
                                                form.notes.length === 500
                                                    ? "text-red-500"
                                                    : "text-gray-500"
                                            }`}
                                    >
                                        {form.notes.length}/500
                                    </p>

                                </div>

                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Mention referral, specific recruiter, etc."
                                    rows="4"
                                    maxLength={500}
                                    className="w-full mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none resize-none"
                                />

                            </div>

                        </div>

                    </div>

                    {/* =========================
                        BULK UPLOAD
                    ========================== */}
                    <div
                        className={
                            activeMode === "bulk"
                                ? "block"
                                : "hidden"
                        }
                    >

                        <BulkUploadApplications
                            onBulkUpload={onBulkUpload}
                            onUploadStateChange={(data) => {
                                setBulkUploadCount(data.count);
                                setBulkUploadAction(
                                    () => data.upload
                                );
                            }}
                        />

                    </div>

                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 bg-white px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-6 border-t border-gray-200 z-10">

                    {/* ONE CANCEL BUTTON ONLY */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto text-gray-600 hover:text-black border border-gray-300 py-2 px-6 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    {/* SINGLE / BULK ACTION */}
                    {activeMode === "single" ? (

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow-md cursor-pointer"
                        >
                            {editingApp ? "Update" : "Save"}
                        </button>

                    ) : (

                        <button
                            type="button"
                            disabled={!bulkUploadAction}
                            onClick={() => bulkUploadAction?.()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow-md cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {bulkUploadCount > 0
                                ? `Upload ${bulkUploadCount} Application${
                                      bulkUploadCount !== 1
                                          ? "s"
                                          : ""
                                  }`
                                : "Upload Applications"}
                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}
export default AddApplication;