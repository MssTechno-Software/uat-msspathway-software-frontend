import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function AddReport({ onClose, onSave, editData, setPopup }) {

    const STAGES = ["Call", "Mail", "Assignment", "L1", "L2", "Offer"];

    const isEdit = !!editData;

    const today = new Date().toISOString().split("T")[0];
    const [stageOpen, setStageOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);

    const [form, setForm] = useState(() => ({
        company: editData?.company || "",
        recruiterName: editData?.recruiterName || "",
        recruiterContact: editData?.recruiterContact || "",
        recruiterEmail: editData?.recruiterEmail || "",
        stage: editData?.stage || "Call",
        status: editData?.status || "Pending",
        date: editData?.date || today,
        notes: editData?.notes || ""
    }));

    const validateForm = () => {

        const trimmedForm = {
            company: form.company.trim(),
            recruiterName: form.recruiterName.trim(),
            recruiterContact: form.recruiterContact.trim(),
            recruiterEmail: form.recruiterEmail.trim(),
            stage: form.stage,
            status: form.status,
            date: form.date,
            notes: form.notes.trim()
        };

        // REQUIRED FIELDS
        if (!isEdit) {
            if (!trimmedForm.company) {
                return setPopup({
                    show: true,
                    message: "Company name is required",
                    type: "error"
                });
            }
            if (!trimmedForm.stage) {
                return setPopup({
                    show: true,
                    message: "Interview stage is required",
                    type: "error"
                });
            }
            if (!trimmedForm.status) {
                return setPopup({
                    show: true,
                    message: "Interview status is required",
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
        }

        // EMAIL VALIDATION
        if (
            trimmedForm.recruiterEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedForm.recruiterEmail)
        ) {
            return setPopup({
                show: true,
                message: "Enter valid recruiter email",
                type: "error"
            });
        }
        return trimmedForm;
    };

    const handleSubmit = () => {
        const validatedForm = validateForm();

        if (!validatedForm) {
            return;
        }

        // Stop progression after rejection
        if (
            editData &&
            editData.status === "Rejected" &&
            form.stage !== editData.stage
        ) {
            return setPopup({
                show: true,
                message: "Cannot move to next stage after rejection",
                type: "error"
            });
        }

        onSave(validatedForm);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start sm:items-center z-50 p-2 sm:p-4 overflow-y-auto">

            <div className="bg-white w-full rounded-2xl max-w-lg sm:max-w-xl md:max-w-2xl shadow-xl flex flex-col max-h-[95vh] mx-2">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {isEdit ? "Update Report Status" : "Add New Report Entry"}
                    </h2>
                </div>

                {/* BODY */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-5">

                    {/* COMPANY */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Company Name {!isEdit && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            placeholder="Enter company name"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            disabled={isEdit}
                            className="w-full mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* RECRUITER NAME */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Recruiter Name
                            </label>
                            <input
                                placeholder="Enter recruiter name"
                                value={form.recruiterName}
                                onChange={(e) => setForm({ ...form, recruiterName: e.target.value })}
                                className="w-full mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none"
                            />
                        </div>

                        {/* RECRUITER CONTACT */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Recruiter Contact
                            </label>
                            <input
                                placeholder="Enter recruiter contact"
                                value={form.recruiterContact}
                                onChange={(e) => setForm({ ...form, recruiterContact: e.target.value })}
                                className="w-full mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none"
                            />
                        </div>
                    </div>

                    {/* RECRUITER EMAIL */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Recruiter Email
                        </label>
                        <input
                            placeholder="Enter recruiter email"
                            value={form.recruiterEmail}
                            onChange={(e) => setForm({ ...form, recruiterEmail: e.target.value })}
                            className="w-full mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none"
                        />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* STAGE */}

                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700">
                                Interview Stage {!isEdit && <span className="text-red-500">*</span>}
                            </label>
                            <div
                                onClick={() => setStageOpen(!stageOpen)}
                                className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-xl mt-2 p-3 cursor-pointer"
                            >
                                <span className="text-sm text-gray-700 truncate cursor-pointer">{form.stage}</span>
                                <FiChevronDown className={`text-gray-500 transition-transform duration-200 
                                    ${stageOpen ? "rotate-180" : ""}`} />

                            </div>

                            {stageOpen && (
                                <div className="absolute w-full bg-white border border-gray-200 rounded-lg mt-2 shadow z-10">
                                    {STAGES.map((stage) => (
                                        <label
                                            key={stage}
                                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="stage"
                                                checked={form.stage === stage}
                                                onChange={() => {
                                                    setForm({ ...form, stage });
                                                    setStageOpen(false);
                                                }}
                                                className="accent-green-700"
                                            />
                                            <span className="text-sm">{stage}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* STATUS */}
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700">
                                Interview Status {!isEdit && <span className="text-red-500">*</span>}
                            </label>
                            <div
                                onClick={() => setStatusOpen(!statusOpen)}
                                className="border rounded-xl p-3 mt-2 cursor-pointer bg-gray-50 flex justify-between items-center border-gray-200"
                            >
                                <span className="text-sm text-gray-700 truncate cursor-pointer">{form.status}</span>
                                <FiChevronDown className={`text-gray-500 transition-transform duration-200 
                                    ${statusOpen ? "rotate-180" : ""}`} />
                            </div>

                            {statusOpen && (
                                <div className="absolute w-full bg-white border border-gray-200 rounded-xl mt-1 shadow z-10">
                                    {["Pending", "Cleared", "Rejected", "Skipped"].map(status => (
                                        <label
                                            key={status}
                                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={form.status === status}
                                                onChange={() => {
                                                    setForm({ ...form, status });
                                                    setStatusOpen(false);
                                                }}
                                                className="accent-green-700"
                                            />
                                            <span className="text-sm">{status}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DATE */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Date {!isEdit && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="date"
                            value={form.date}
                            max={today}
                            onChange={(e) => {
                                setForm({ ...form, date: e.target.value });
                            }}
                            className="w-full mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none"
                        />
                    </div>

                    {/* NOTES */}
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">
                                Internal Notes
                            </label>

                            <p
                                className={`text-xs mt-1 text-right 
                                ${form.notes.length === 500 ? "text-red-500" : "text-gray-500"}`}
                            >
                                {form.notes.length}/500
                            </p>
                        </div>
                        <textarea
                            name="notes"
                            placeholder="Enter interview notes..."
                            value={form.notes}
                            onChange={(e) => {
                                setForm({ ...form, notes: e.target.value });
                            }}
                            maxLength={500}
                            className="w-full mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none resize-none h-24"
                        />
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-200 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="bg-green-800 text-white px-5 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
                    >
                        {isEdit ? "Update" : "Save Entry"}
                    </button>
                </div>

            </div>
        </div>
    );
}