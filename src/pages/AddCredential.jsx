import { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLink } from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";

function AddCredential({ onClose, onSave, editingData, setPopup }) {

  const [form, setForm] = useState(() => ({
    portal: editingData?.portal || "",
    portalLink: editingData?.portalLink || "",
    email: editingData?.email || "",
    password: editingData?.password || "",
    notes: editingData?.notes || ""
}));

    const [showPassword, setShowPassword] = useState(false);


    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    //validation can be added here before submission
    const validate = () => {

        const trimmedForm = {
            portal: form.portal.trim(),
            portalLink: form.portalLink.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
            notes: form.notes.trim()
        };

        // REQUIRED FIELDS
        if (!trimmedForm.portal) {
            return setPopup({
                show: true,
                message: "Portal name is required",
                type: "error"
            });
        }

        if (!trimmedForm.portalLink) {
            return setPopup({
                show: true,
                message: "Portal link is required",
                type: "error"
            });
        }

        if (!trimmedForm.email) {
            return setPopup({
                show: true,
                message: "Email address is required",
                type: "error"
            });
        }

        if (!trimmedForm.password) {
            return setPopup({
                show: true,
                message: "Password is required",
                type: "error"
            });
        }

        // FLEXIBLE URL VALIDATION
        let value = trimmedForm.portalLink;

        if (!/^https?:\/\//i.test(value)) {
            value = "https://" + value;
        }

        const urlPattern =
            /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=.]*)?$/i;

        if (!urlPattern.test(value)) {
            return setPopup({
                show: true,
                message: "Enter valid portal link",
                type: "error"
            });
        }

        trimmedForm.portalLink = value;

        // EMAIL VALIDATION
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedForm.email)) {
            return setPopup({
                show: true,
                message: "Enter valid email address",
                type: "error"
            });
        }

        return trimmedForm;
    };

    const handleSubmit = () => {
        const validatedForm = validate();

        if (!validatedForm) return;

        onSave(validatedForm);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-120 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] mx-2">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editingData ? "Update Credential" : "Add Credential"}
                    </h2>
                </div>

                {/* BODY */}
                <div className="px-6 pb-6 overflow-y-auto space-y-5">

                    {/* PORTAL */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Portal Name <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <BsBuilding className="text-gray-400 mr-2" />
                            <input
                                name="portal"
                                value={form.portal}
                                onChange={handleChange}
                                placeholder="e.g. SalesForce, AWS"
                                className="w-full py-3 outline-none bg-transparent"
                            />
                        </div>

                    </div>

                    {/* PORTAL LINK*/}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Portal Link <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <FiLink className="text-gray-400 mr-2" />
                            <input
                                name="portalLink"
                                value={form.portalLink}
                                onChange={handleChange}
                                placeholder="https://portal.example.com"
                                className="w-full py-3 outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Email Address <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <FiMail className="text-gray-400 mr-2" />
                            <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="w-full py-3 outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Password <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                            <FiLock className="text-gray-400 mr-2" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full py-3 outline-none bg-transparent"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 cursor-pointer focus:outline-none"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">
                                Notes (Optional)
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
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Mention referral, specific recruiter, etc."
                            rows="4"
                            maxLength={500}
                            className="w-full mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none"
                        />
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex gap-4 pt-2 p-4 border-t border-gray-100 bg-white sticky bottom-0">

                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 py-3 rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer font-medium"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-green-800 hover:bg-green-700 text-white py-3 rounded-xl shadow-md cursor-pointer font-medium"
                    >
                        {editingData ? "Update" : "Save"}
                    </button>

                </div>
            </div>
        </div>
    );
}

export default AddCredential;